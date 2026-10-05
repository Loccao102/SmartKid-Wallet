import { createParentLinkCode, createStudentAccount } from './teacherRemote'

// Parse & chuẩn hóa danh sách học sinh từ file Excel (.xlsx/.xls) hoặc CSV mà
// giáo viên tải lên. Toàn bộ logic chạy ở client để giáo viên xem trước và sửa
// lỗi ngay trước khi "Tạo tài khoản hàng loạt" đẩy lên Supabase.

export interface RosterIssue {
  level: 'error' | 'warning'
  message: string
}

export interface ParsedStudentRow {
  rowNumber: number
  displayName: string
  username: string
  password: string
  parentEmail: string
  issues: RosterIssue[]
}

export interface RosterParseResult {
  fileName: string
  sheetName: string
  rows: ParsedStudentRow[]
  warnings: string[]
}

export interface RosterCreatedAccount {
  rowNumber: number
  displayName: string
  username: string
  password: string
  parentEmail: string
  studentCode: string
  authUserId: string
}

export interface RosterFailedRow {
  rowNumber: number
  displayName: string
  username: string
  reason: string
}

export interface RosterBatchResult {
  created: RosterCreatedAccount[]
  failed: RosterFailedRow[]
  parentCodesGenerated: number
}

const NAME_KEYS = ['tên học sinh', 'ten hoc sinh', 'họ tên', 'ho ten', 'tên đầy đủ', 'ten day du', 'fullname', 'full name', 'name', 'tên', 'ten']
const USERNAME_KEYS = ['username', 'user name', 'tài khoản', 'tai khoan', 'đăng nhập', 'dang nhap', 'mã đăng nhập', 'login', 'account']
const PASSWORD_KEYS = ['mật khẩu tạm', 'mat khau tam', 'mật khẩu', 'mat khau', 'password', 'mk']
const PARENT_EMAIL_KEYS = ['email phụ huynh', 'email phu huynh', 'phụ huynh', 'phu huynh', 'parent email', 'email']

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function foldKey(header: string) {
  return stripDiacritics(header).toLowerCase().replace(/[_\-.]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function keyMatches(cellKey: string, candidate: string) {
  if (!cellKey || !candidate) return false
  return cellKey === candidate || cellKey.includes(candidate) || candidate.includes(cellKey)
}

function findColumn(headers: string[], candidates: string[]) {
  for (const candidate of candidates) {
    const index = headers.findIndex((header) => header === candidate)
    if (index >= 0) return index
  }
  for (const candidate of candidates) {
    const index = headers.findIndex((header) => keyMatches(header, candidate))
    if (index >= 0) return index
  }
  return -1
}

// 'Nguyễn Thị Hoa' -> 'nguyen-thi-hoa'; 'Đặng Văn  Nam' -> 'dang-van-nam'
export function slugifyName(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Loại các ký tự ngoài bảng a-z0-9 (dấu cách → dấu chấm) cho khớp regex của
// edge function teacher-student-admin.
export function sanitizeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 32)
}

function cellText(row: unknown[] | undefined, index: number) {
  if (index < 0 || !row) return ''
  const cell = row[index]
  if (cell === null || cell === undefined) return ''
  return String(cell).trim()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
}

export async function parseStudentRosterFile(data: ArrayBuffer, fileName: string): Promise<RosterParseResult> {
  const XLSX = await import('xlsx')
  const isCsv = /\.csv$/i.test(fileName)
  const workbook = isCsv
    ? XLSX.read(new TextDecoder().decode(new Uint8Array(data)), { type: 'string', codepage: 65001 })
    : XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0] ?? ''
  if (!sheetName) throw new Error('File không có sheet nào.')
  const sheet = workbook.Sheets[sheetName]
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: '',
    raw: false,
  })

  let headerIndex = -1
  let headers: string[] = []
  let colName = -1
  let colUser = -1
  let colPass = -1
  let colEmail = -1

  // Tìm dòng tiêu đề trong 10 dòng đầu (file thực tế hay có dòng tựa ở trên).
  const scanLimit = Math.min(matrix.length, 10)
  for (let i = 0; i < scanLimit; i += 1) {
    const row = matrix[i] ?? []
    const cells = row.map((cell) => foldKey(String(cell ?? '').trim())).filter(Boolean)
    const nameIdx = findColumn(cells, NAME_KEYS)
    if (nameIdx >= 0) {
      headerIndex = i
      headers = row.map((cell) => foldKey(String(cell ?? '').trim()))
      colName = nameIdx
      colUser = findColumn(headers, USERNAME_KEYS)
      colPass = findColumn(headers, PASSWORD_KEYS)
      colEmail = findColumn(headers, PARENT_EMAIL_KEYS)
      break
    }
  }
  if (headerIndex < 0) {
    throw new Error('Không tìm thấy cột "Tên học sinh". File cần có cột: Tên học sinh, Username (tùy chọn), Email phụ huynh (tùy chọn).')
  }

  const dataRows = matrix.slice(headerIndex + 1)
  const hasExplicitUsername = colUser >= 0
  const usedPasswords = new Set<string>()
  const rows: ParsedStudentRow[] = []
  const usernameCount = new Map<string, number>()

  // Tìm cột mật khẩu thực sự: ưu tiên khớp chính xác, rồi mới khớp gần đúng
  // (tránh tiêu đề như "Mk học sinh" bị bỏ sót hoặc khớp nhầm cột khác).
  if (colPass >= 0) {
    const passCell = foldKey(String((matrix[headerIndex] ?? [])[colPass] ?? '').trim())
    const exact = PASSWORD_KEYS.some((candidate) => passCell === candidate)
    const contains = PASSWORD_KEYS.some((candidate) => passCell.includes(candidate))
    if (!exact && !contains) colPass = -1
  }

  dataRows.forEach((row, offset) => {
    const displayName = cellText(row, colName)
    if (!displayName) return
    const rowNumber = headerIndex + offset + 2
    const baseUsername = hasExplicitUsername ? cellText(row, colUser) : ''
    const explicitPassword = cellText(row, colPass)
    const parentEmailRaw = cellText(row, colEmail)
    const parentEmail = parentEmailRaw.toLowerCase()

    const issues: RosterIssue[] = []
    if (displayName.length > 120) {
      issues.push({ level: 'error', message: 'Tên vượt quá 120 ký tự.' })
    }

    let username = sanitizeUsername(baseUsername || slugifyName(displayName))
    if (username.length < 3) {
      username = ('hs-' + slugifyName(displayName)).slice(0, 32)
    }
    if (username.length > 32) username = username.slice(0, 32)
    if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
      // Không thể tự sinh từ tên (ví dụ tên chỉ chứa ký tự đặc biệt).
      username = ''
      issues.push({ level: 'error', message: 'Không tạo được username hợp lệ từ dữ liệu dòng này — giáo viên cần nhập tay.' })
    }
    usernameCount.set(username, (usernameCount.get(username) ?? 0) + 1)

    const password = explicitPassword || generateTempPassword()
    if (explicitPassword && explicitPassword.length < 8) {
      issues.push({ level: 'error', message: 'Mật khẩu tạm cần ít nhất 8 ký tự.' })
    }
    if (parentEmail && !isValidEmail(parentEmail)) {
      issues.push({ level: 'warning', message: 'Email phụ huynh không hợp lệ, sẽ bỏ qua liên kết phụ huynh.' })
    }

    rows.push({
      rowNumber,
      displayName,
      username,
      password,
      parentEmail: parentEmail && isValidEmail(parentEmail) ? parentEmail : '',
      issues,
    })
    if (explicitPassword) usedPasswords.add(explicitPassword)
  })

  // Đảm bảo username duy nhất trong file (thêm số thứ tự cho các bản lặp lại,
  // giữ nguyên tên lần xuất hiện đầu tiên).
  const seen = new Map<string, number>()
  rows.forEach((row) => {
    if (!row.username) return
    const count = usernameCount.get(row.username) ?? 1
    if (count <= 1) return
    const occurrence = (seen.get(row.username) ?? 0) + 1
    seen.set(row.username, occurrence)
    if (occurrence === 1) return
    let candidate = sanitizeUsername(row.username + '-' + occurrence).slice(0, 32)
    while (usernameCount.has(candidate)) {
      const next = (seen.get(candidate) ?? 0) + 1
      seen.set(candidate, next)
      candidate = sanitizeUsername(row.username + '-' + occurrence + '.' + next).slice(0, 32)
    }
    usernameCount.set(candidate, 1)
    row.username = candidate
    row.issues.push({ level: 'warning', message: `Trùng username trong file, đã đổi thành "${candidate}".` })
  })

  // Đảm bảo mật khẩu tự sinh là duy nhất trong lô này.
  rows.forEach((row) => {
    while (usedPasswords.has(row.password)) row.password = generateTempPassword()
    usedPasswords.add(row.password)
  })

  const warnings: string[] = []
  if (!hasExplicitUsername) {
    warnings.push('File không có cột Username nên hệ thống tự sinh từ họ tên (bỏ dấu, nối bằng dấu "-").')
  }
  if (colEmail < 0) {
    warnings.push('File không có cột Email phụ huynh — bạn vẫn có thể tạo mã liên kết phụ huynh sau.')
  }

  return { fileName, sheetName, rows, warnings }
}

export async function createStudentsFromRoster(
  input: {
    classroomId: string
    rows: ParsedStudentRow[]
    linkParents?: boolean
  },
  onProgress?: (done: number, total: number) => void,
): Promise<RosterBatchResult> {
  const created: RosterCreatedAccount[] = []
  const failed: RosterFailedRow[] = []
  let parentCodesGenerated = 0

  for (let index = 0; index < input.rows.length; index += 1) {
    const row = input.rows[index]
    try {
      const result = await createStudentAccount({
        classroomId: input.classroomId,
        displayName: row.displayName,
        username: row.username,
        password: row.password,
      })
      // Edge function teacher-student-admin trả về { student: { authUserId, studentCode, ... } }
      const payload = result as { student?: Record<string, unknown> } | null
      const student = payload?.student ?? null
      const authUserId = String(
        student?.authUserId ?? (payload as Record<string, unknown> | null)?.authUserId ?? '',
      )

      if (input.linkParents && row.parentEmail && authUserId) {
        try {
          const link = await createParentLinkCode(authUserId)
          if (link?.link_code) parentCodesGenerated += 1
        } catch {
          // Không chặn luồng tạo tài khoản nếu bước liên kết phụ huynh lỗi.
        }
      }

      created.push({
        rowNumber: row.rowNumber,
        displayName: row.displayName,
        username: row.username,
        password: row.password,
        parentEmail: row.parentEmail,
        studentCode: String(student?.studentCode ?? ''),
        authUserId,
      })
    } catch (err) {
      failed.push({
        rowNumber: row.rowNumber,
        displayName: row.displayName,
        username: row.username,
        reason: err instanceof Error ? err.message : 'Không tạo được tài khoản.',
      })
    }
    onProgress?.(index + 1, input.rows.length)
  }

  return { created, failed, parentCodesGenerated }
}

export function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const bytes = new Uint32Array(10)
  crypto.getRandomValues(bytes)
  return 'Sk!' + Array.from(bytes, (value) => chars[value % chars.length]).join('')
}

export function rosterRowsToCsv(rows: ParsedStudentRow[]) {
  const escapeCell = (value: string) => '"' + value.replace(/"/g, '""') + '"'
  const lines = [
    'Tên học sinh,Username,Mật khẩu tạm,Email phụ huynh',
    ...rows.map((row) =>
      [row.displayName, row.username, row.password, row.parentEmail].map(escapeCell).join(','),
    ),
  ]
  return '\ufeff' + lines.join('\r\n')
}

export function createdAccountsToCsv(created: RosterCreatedAccount[]) {
  const escapeCell = (value: string) => '"' + value.replace(/"/g, '""') + '"'
  const lines = [
    'Tên học sinh,Username,Mật khẩu tạm,Email phụ huynh',
    ...created.map((account) =>
      [account.displayName, account.username, account.password, account.parentEmail]
        .map(escapeCell)
        .join(','),
    ),
  ]
  return '\ufeff' + lines.join('\r\n')
}
