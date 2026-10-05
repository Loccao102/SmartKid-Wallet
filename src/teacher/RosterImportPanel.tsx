import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import type { ClassroomRow } from '../lib/teacherRemote'
import {
  createStudentsFromRoster,
  createdAccountsToCsv,
  parseStudentRosterFile,
  rosterRowsToCsv,
  type RosterBatchResult,
  type RosterParseResult,
} from '../lib/studentRoster'

// Panel "Import danh sách học sinh" cho giáo viên:
// 1) Tải file Excel/CSV -> parse + xem trước (username/mật khẩu tự sinh nếu thiếu)
// 2) Sửa lỗi ngay trên bảng preview
// 3) "Tạo tài khoản hàng loạt" -> gọi edge function teacher-student-admin từng dòng
// 4) Kết quả một lần duy nhất: sao chép / tải file credentials cho phụ huynh

const TEMPLATE_HEADER = 'Tên học sinh,Username,Mật khẩu tạm,Email phụ huynh\nNguyễn Minh Anh,minhanh,,minh.anh.parent@example.com\nTrần Gia Hân,,,han.parent@example.com\n'

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function RosterImportPanel({
  classroom,
  onClose,
  onFinished,
}: {
  classroom: ClassroomRow
  onClose: () => void
  onFinished: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsed, setParsed] = useState<RosterParseResult | null>(null)
  const [parseError, setParseError] = useState('')
  const [parsing, setParsing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [linkParents, setLinkParents] = useState(true)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<RosterBatchResult | null>(null)

  const validRows = useMemo(
    () => parsed?.rows.filter((row) => !row.issues.some((issue) => issue.level === 'error')) ?? [],
    [parsed],
  )
  const errorCount = (parsed?.rows.length ?? 0) - validRows.length

  const handleFile = async (file: File) => {
    setParseError('')
    setResult(null)
    setParsing(true)
    try {
      const buffer = await file.arrayBuffer()
      const next = await parseStudentRosterFile(buffer, file.name)
      if (!next.rows.length) {
        setParseError('File không có dòng học sinh hợp lệ nào (cột "Tên học sinh" trống).')
        setParsed(null)
      } else {
        setParsed(next)
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Không đọc được file.')
      setParsed(null)
    } finally {
      setParsing(false)
    }
  }

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await handleFile(file)
    event.target.value = ''
  }

  const updateRow = (index: number, patch: Partial<{ username: string; parentEmail: string }>) => {
    if (!parsed) return
    setParsed({
      ...parsed,
      rows: parsed.rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    })
  }

  const runImport = async () => {
    if (!validRows.length || progress) return
    setProgress({ done: 0, total: validRows.length })
    const batch = await createStudentsFromRoster(
      { classroomId: classroom.classroom_id, rows: validRows, linkParents },
      (done, total) => setProgress({ done, total }),
    )
    setResult(batch)
    onFinished()
  }

  const copyAllCredentials = async () => {
    if (!result) return
    const lines = result.created.map(
      (account) =>
        `${account.displayName} | Mã lớp ${classroom.join_code} | ${account.username} | ${account.password}`,
    )
    await navigator.clipboard.writeText(['SmartKid Wallet — tài khoản học sinh', ...lines].join('\n'))
  }

  const importing = progress !== null && result === null

  return (
    <div className="teacher-dialog-backdrop" role="presentation">
      <section className="teacher-dialog teacher-dialog-wide" role="dialog" aria-modal="true">
        <header>
          <div>
            <p className="teacher-eyebrow">{classroom.name.toUpperCase()} · MÃ LỚP {classroom.join_code}</p>
            <h2>Import danh sách học sinh từ Excel</h2>
          </div>
          <button type="button" className="teacher-icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {result ? (
          <div className="teacher-roster-result">
            <div className="teacher-credential-card">
              <span className="teacher-success-icon"><Check size={25} /></span>
              <div>
                <h3>Đã tạo {result.created.length} tài khoản</h3>
                <p>
                  Mật khẩu chỉ hiển thị một lần duy nhất — hãy sao chép hoặc tải file
                  credentials rồi gửi cho học sinh / phụ huynh.
                  {result.parentCodesGenerated > 0
                    ? ` Đã cấp ${result.parentCodesGenerated} mã liên kết phụ huynh (hạn 7 ngày).`
                    : ''}
                </p>
              </div>
              <div className="teacher-roster-result-actions">
                <button type="button" className="teacher-secondary" onClick={() => void copyAllCredentials()}>
                  <Copy size={17} /> Sao chép tất cả
                </button>
                <button
                  type="button"
                  className="teacher-secondary"
                  onClick={() => downloadTextFile('smartkid-tai-khoan-hoc-sinh.csv', createdAccountsToCsv(result.created))}
                >
                  <Download size={17} /> Tải file credentials
                </button>
              </div>
            </div>

            {result.failed.length > 0 ? (
              <p className="teacher-form-message is-error">
                <AlertTriangle size={16} /> {result.failed.length} dòng lỗi:
                {' '}
                {result.failed.map((item) => `dòng ${item.rowNumber} (${item.displayName}): ${item.reason}`).join('; ')}
              </p>
            ) : null}

            <div className="teacher-roster-table-wrap">
              <table className="teacher-roster-table">
                <thead>
                  <tr><th>Học sinh</th><th>Username</th><th>Mật khẩu tạm</th><th>Email phụ huynh</th></tr>
                </thead>
                <tbody>
                  {result.created.map((account) => (
                    <tr key={account.authUserId || account.username}>
                      <td>{account.displayName}</td>
                      <td><code>{account.username}</code></td>
                      <td><code>{account.password}</code></td>
                      <td>{account.parentEmail || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="teacher-dialog-actions">
              <button type="button" className="teacher-primary" onClick={onClose}>Xong</button>
            </div>
          </div>
        ) : !parsed ? (
          <div className="teacher-roster-dropzone-wrap">
            <div
              className={'teacher-roster-dropzone' + (dragOver ? ' is-over' : '')}
              onDragOver={(event) => { event.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragOver(false)
                const file = event.dataTransfer.files?.[0]
                if (file) void handleFile(file)
              }}
            >
              <FileSpreadsheet size={34} />
              <strong>Kéo thả file Excel vào đây</strong>
              <small>Hỗ trợ .xlsx, .xls, .csv. Cột bắt buộc: “Tên học sinh”. Tùy chọn: Username, Mật khẩu tạm, Email phụ huynh.</small>
              <button
                type="button"
                className="teacher-primary"
                disabled={parsing}
                onClick={() => fileInputRef.current?.click()}
              >
                {parsing ? <LoaderCircle size={18} className="is-spinning" /> : <Upload size={18} />}
                {parsing ? 'Đang đọc file…' : 'Chọn file'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                hidden
                onChange={(event) => void onInputChange(event)}
              />
            </div>
            {parseError ? <p className="teacher-form-message is-error">{parseError}</p> : null}
            <button
              type="button"
              className="teacher-link-button"
              onClick={() => downloadTextFile('mau-danh-sach-hoc-sinh.csv', TEMPLATE_HEADER)}
            >
              <Download size={16} /> Tải file mẫu danh sách học sinh
            </button>
          </div>
        ) : (
          <div className="teacher-roster-preview">
            <div className="teacher-roster-summary">
              <span><FileSpreadsheet size={17} /> {parsed.fileName} · sheet “{parsed.sheetName}”</span>
              <strong>{parsed.rows.length} học sinh</strong>
              {errorCount > 0 ? (
                <span className="is-error"><AlertTriangle size={16} /> {errorCount} dòng cần sửa</span>
              ) : (
                <span className="is-ok"><ShieldCheck size={16} /> Hợp lệ</span>
              )}
            </div>

            {parsed.warnings.map((warning) => (
              <p key={warning} className="teacher-roster-warning">{warning}</p>
            ))}

            <div className="teacher-roster-table-wrap">
              <table className="teacher-roster-table">
                <thead>
                  <tr>
                    <th>#</th><th>Tên học sinh</th><th>Username</th>
                    <th>Mật khẩu tạm</th><th>Email phụ huynh</th><th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.map((row, index) => {
                    const hasError = row.issues.some((issue) => issue.level === 'error')
                    return (
                      <tr key={row.rowNumber} className={hasError ? 'is-error-row' : ''}>
                        <td>{index + 1}</td>
                        <td>{row.displayName}</td>
                        <td>
                          <input
                            value={row.username}
                            onChange={(event) => updateRow(index, { username: event.target.value })}
                          />
                        </td>
                        <td><code>{row.password}</code></td>
                        <td>
                          <input
                            value={row.parentEmail}
                            placeholder="(bỏ trống)"
                            onChange={(event) => updateRow(index, { parentEmail: event.target.value })}
                          />
                        </td>
                        <td className="teacher-roster-notes">
                          {row.issues.map((issue, i) => (
                            <small key={i} className={issue.level}>{issue.message}</small>
                          ))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <label className="teacher-roster-option">
              <input
                type="checkbox"
                checked={linkParents}
                onChange={(event) => setLinkParents(event.target.checked)}
              />
              Tự sinh mã liên kết phụ huynh cho các dòng có email (mã hạn 7 ngày)
            </label>

            {importing ? (
              <p className="teacher-roster-progress">
                <LoaderCircle size={17} className="is-spinning" />
                Đang tạo tài khoản… {progress.done}/{progress.total}
              </p>
            ) : null}

            <div className="teacher-dialog-actions">
              <button
                type="button"
                className="teacher-secondary"
                disabled={importing}
                onClick={() => downloadTextFile(
                  'smartkid-danh-sach-xem-truoc.csv',
                  rosterRowsToCsv(parsed.rows),
                )}
              >
                <Download size={17} /> Tải bản xem trước
              </button>
              <button type="button" className="teacher-secondary" disabled={importing} onClick={() => setParsed(null)}>
                Chọn file khác
              </button>
              <button
                type="button"
                className="teacher-primary"
                disabled={importing || validRows.length === 0}
                onClick={() => void runImport()}
              >
                {importing
                  ? 'Đang tạo…'
                  : `Tạo ${validRows.length} tài khoản hàng loạt`}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
