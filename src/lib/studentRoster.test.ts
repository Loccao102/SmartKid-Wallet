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

  it('giữ đúng chỉ số cột dù header Excel có ô trống phía trước tên', async () => {
    const buffer = buildWorkbookBuffer([
      ['', 'STT', '', 'Tên học sinh', 'Username', 'Mật khẩu tạm'],
      ['', 1, '', 'Nguyễn Thị Hoa', 'hoa-test', 'MatKhau123'],
      ['', 2, '', 'Trần Văn Sơn', 'son-test', 'OtherPass456'],
    ])

    const result = await parseStudentRosterFile(buffer, 'header-gap.xlsx')
    expect(result.rows).toHaveLength(2)
    expect(result.rows.map((student) => student.displayName)).toEqual([
      'Nguyễn Thị Hoa', 'Trần Văn Sơn',
    ])
    expect(result.rows.map((student) => student.username)).toEqual(['hoa-test', 'son-test'])
    expect(result.rows.map((student) => student.password)).toEqual(['MatKhau123', 'OtherPass456'])
  })

  it('hiển thị lỗi thay vì âm thầm bỏ qua hàng có tài khoản nhưng thiếu tên', async () => {
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh', 'Username', 'Mật khẩu tạm', 'Email phụ huynh'],
      ['', 'missing-name', 'MatKhau123', 'family@example.com'],
      ['', '', '', ''],
      ['Trần Lan', 'tran-lan', 'OtherPass456', ''],
    ])

    const result = await parseStudentRosterFile(buffer, 'missing-name.xlsx')
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0].rowNumber).toBe(2)
    expect(result.rows[0].displayName).toBe('')
    expect(result.rows[0].username).toBe('missing-name')
    expect(result.rows[0].issues).toContainEqual({
      level: 'error',
      message: 'Thiếu tên học sinh.',
    })
    expect(result.rows[1].rowNumber).toBe(4)
    expect(result.rows[1].displayName).toBe('Trần Lan')
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

  it('giữ nguyên nhiều mật khẩu nhập tay khác nhau trong cùng một file', async () => {
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh', 'Username', 'Mật khẩu tạm'],
      ['Nguyễn An', 'nguyen-an', 'MatKhau123'],
      ['Trần Bình', 'tran-binh', 'OtherPass456'],
    ])

    const result = await parseStudentRosterFile(buffer, 'hs.xlsx')
    expect(result.rows.map((row) => row.password)).toEqual(['MatKhau123', 'OtherPass456'])
    expect(result.rows.every((row) => row.issues.every((issue) => issue.level !== 'error'))).toBe(true)
  })

  it('báo lỗi mật khẩu nhập tay trùng nhau thay vì âm thầm thay đổi', async () => {
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh', 'Mật khẩu tạm'],
      ['Nguyễn An', 'SamePass123'],
      ['Trần Bình', 'SamePass123'],
    ])

    const result = await parseStudentRosterFile(buffer, 'hs.xlsx')
    expect(result.rows.map((row) => row.password)).toEqual(['SamePass123', 'SamePass123'])
    expect(result.rows.every((row) => row.issues.some((issue) =>
      issue.level === 'error' && issue.message.includes('trùng')
    ))).toBe(true)
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

  it('tạo suffix cho username 32 ký tự ngay cả khi suffix -2 đã được giữ chỗ', async () => {
    const base = 'nguyenvanthanhdanh123456789012345'.slice(0, 32)
    expect(base).toHaveLength(32)
    const reserved = base.slice(0, 30) + '-2'
    const buffer = buildWorkbookBuffer([
      ['Tên học sinh', 'Username'],
      ['Bạn A', base],
      ['Bạn B', base],
      ['Bạn C', base],
      ['Bạn D', reserved],
    ])

    const result = await parseStudentRosterFile(buffer, 'long-username.xlsx')
    expect(result.rows.map((row) => row.username)).toEqual([
      base,
      base.slice(0, 30) + '-3',
      base.slice(0, 30) + '-4',
      reserved,
    ])
    expect(new Set(result.rows.map((row) => row.username)).size).toBe(4)
    expect(result.rows.every((row) => row.username.length <= 32)).toBe(true)
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

  it('không cho công thức trong tên và mật khẩu chạy khi mở CSV bằng bảng tính', () => {
    const sample = {
      rowNumber: 4,
      displayName: '=HYPERLINK("https://unsafe.example","Nhấn")',
      username: 'student-safe',
      password: '   +SUM(1,2)',
      parentEmail: '',
      issues: [],
    }
    const csv = rosterRowsToCsv([sample])
    expect(csv).toContain('"' + "'" + '=HYPERLINK(""https://unsafe.example"",""Nhấn"")"')
    expect(csv).toContain('"' + "'" + '   +SUM(1,2)"')
    const accountsCsv = createdAccountsToCsv([{
      ...sample, studentCode: 'SK-1', authUserId: 'uuid-1',
    }])
    expect(accountsCsv).toContain('"' + "'" + '=HYPERLINK(')
    expect(accountsCsv).toContain('"' + "'" + '   +SUM(1,2)"')
    expect(rosterRowsToCsv([{ ...sample, displayName: 'Tên bình thường', password: 'MatKhau123' }]))
      .toContain('"Tên bình thường","student-safe","MatKhau123"')
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
