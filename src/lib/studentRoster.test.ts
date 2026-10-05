// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import {
  createdAccountsToCsv,
  parseStudentRosterFile,
  rosterRowsToCsv,
  sanitizeUsername,
  slugifyName,
} from './studentRoster'

function buildWorkbookBuffer(rows: unknown[][]) {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Danh sach')
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

describe('slugifyName / sanitizeUsername', () => {
  it('bỏ dấu tiếng Việt và nối bằng dấu gạch', () => {
    expect(slugifyName('Nguyễn Thị Hoa')).toBe('nguyen-thi-hoa')
    expect(slugifyName('Đặng   Văn Nam')).toBe('dang-van-nam')
  })

  it('chỉ giữ ký tự hợp lệ cho edge function', () => {
    expect(sanitizeUsername('Lê Minh@Anh!')).toBe('l.minhanh')
    expect(sanitizeUsername('  a b  ')).toBe('a.b')
    expect(sanitizeUsername(slugifyName('Lê Minh Anh'))).toBe('le-minh-anh')
  })
})

describe('parseStudentRosterFile (Excel)', () => {
  it('đọc file xlsx có tiêu đề tiếng Việt, tự sinh username và mật khẩu', async () => {
    const buffer = buildWorkbookBuffer([
      ['Bảng danh sách lớp 3A'],
      [],
      ['STT', 'Tên học sinh', 'Email phụ huynh'],
      [1, 'Nguyễn Minh Anh', 'PHUYNHU@Example.com'],
      [2, 'Trần Gia Bảo', ''],
      ['', '', ''],
    ])

    const result = await parseStudentRosterFile(buffer, 'lop-3a.xlsx')
    expect(result.sheetName).toBe('Danh sach')
    expect(result.rows).toHaveLength(2)

    const first = result.rows[0]
    expect(first.displayName).toBe('Nguyễn Minh Anh')
    expect(first.username).toBe('nguyen-minh-anh')
    expect(first.password.length).toBeGreaterThanOrEqual(8)
    expect(first.parentEmail).toBe('phuynhu@example.com')
    expect(first.issues.filter((issue) => issue.level === 'error')).toHaveLength(0)

    expect(result.warnings.some((text) => text.includes('Username'))).toBe(true)
  })

  it('giữ username và mật khẩu tường minh nếu cột tồn tại', async () => {
    const buffer = buildWorkbookBuffer([
      ['Họ tên', 'Username', 'Mật khẩu tạm'],
      ['Phạm Nam', 'phamnamsuper', 'MatKhau123'],
    ])

    const result = await parseStudentRosterFile(buffer, 'hs.xlsx')
    expect(result.rows[0].username).toBe('phamnamsuper')
    expect(result.rows[0].password).toBe('MatKhau123')
  })

  it('báo lỗi khi thiếu tên hoặc mật khẩu quá ngắn', async () => {
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh', 'Mật khẩu'],
      ['Lý Hải', 'abc'],
    ])

    const result = await parseStudentRosterFile(buffer, 'hs.xlsx')
    expect(result.rows[0].issues.some((issue) => issue.level === 'error')).toBe(true)
  })

  it('đánh số username khi trùng tên trong file', async () => {
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh'],
      ['Nguyễn Văn An'],
      ['Nguyễn Văn An'],
    ])

    const result = await parseStudentRosterFile(buffer, 'hs.xlsx')
    const [first, second] = result.rows
    expect(first.username).toBe('nguyen-van-an')
    expect(second.username).not.toBe(first.username)
    expect(second.issues.some((issue) => issue.level === 'warning')).toBe(true)
  })

  it('từ chối file không có cột tên', async () => {
    const buffer = buildWorkbookBuffer([
      ['STT', 'Ghi chú'],
      [1, 'không dùng được'],
    ])

    await expect(parseStudentRosterFile(buffer, 'bad.xlsx')).rejects.toThrow(/Tên học sinh/)
  })

  it('đọc trực tiếp file CSV chuẩn hóa UTF-8', async () => {
    const csv = '\ufeffTên học sinh,Username\nVũ Thị Lan,vulan\n'
    const buffer = new TextEncoder().encode(csv).buffer

    const result = await parseStudentRosterFile(buffer, 'lop.csv')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].username).toBe('vulan')
  })
})

describe('xuất CSV thông tin tài khoản', () => {
  it('rosterRowsToCsv bọc ô chứa dấu phẩy và có BOM', () => {
    const csv = rosterRowsToCsv([
      {
        rowNumber: 4,
        displayName: 'Nguyễn, Minh Anh',
        username: 'nguyen-minh-anh',
        password: 'Sk!Abc12345',
        parentEmail: 'a@b.com',
        issues: [],
      },
    ])
    expect(csv.startsWith('\ufeff')).toBe(true)
    expect(csv).toContain('"Nguyễn, Minh Anh"')
  })

  it('createdAccountsToCsv liệt kê đúng hàng đã tạo', () => {
    const csv = createdAccountsToCsv([
      {
        rowNumber: 1,
        displayName: 'Trần B',
        username: 'tran-b',
        password: 'Sk!Xyz9876',
        parentEmail: '',
        studentCode: 'SK-ABC-TRANB-12345',
        authUserId: 'uuid',
      },
    ])
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(csv).toContain('tran-b')
  })
})
