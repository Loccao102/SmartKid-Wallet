// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createStudentAccount: vi.fn(),
  createParentLinkCode: vi.fn(),
}))
vi.mock('./teacherRemote', () => mocks)

import { createStudentsFromRoster, type ParsedStudentRow } from './studentRoster'

function row(
  rowNumber: number,
  username: string,
  password: string,
  issues: ParsedStudentRow['issues'] = [],
): ParsedStudentRow {
  return {
    rowNumber,
    displayName: `Học sinh ${rowNumber}`,
    username,
    password,
    parentEmail: '',
    issues,
  }
}

describe('createStudentsFromRoster fail-closed validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createStudentAccount.mockImplementation(async ({ username }: { username: string }) => ({
      student: { authUserId: `auth-${username}`, studentCode: `ST-${username}` },
    }))
  })

  it('không gửi các dòng parser đã đánh dấu lỗi lên backend', async () => {
    const progress: number[] = []
    const result = await createStudentsFromRoster({
      classroomId: 'test-class',
      rows: [
        row(2, 'student-one', 'Abcdefg123'),
        row(3, 'student-two', 'Abcdefg123', [
          { level: 'error', message: 'Mật khẩu tạm bị trùng giữa các học sinh.' },
        ]),
        row(4, 'student-three', 'Hijklm456', [
          { level: 'warning', message: 'Email phụ huynh không hợp lệ.' },
        ]),
      ],
    }, (done) => progress.push(done))
    expect(result.created.map((item) => item.username)).toEqual(['student-one', 'student-three'])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].rowNumber).toBe(3)
    expect(result.failed[0].reason).toContain('trùng')
    expect(mocks.createStudentAccount).toHaveBeenCalledTimes(2)
    expect(progress).toEqual([1, 2, 3])
  })

  it('ngăn trùng username và password ngay cả khi UI bỏ qua kiểm tra parser', async () => {
    const result = await createStudentsFromRoster({
      classroomId: 'test-class',
      rows: [
        row(2, 'student-one', 'Abcdefg123'),
        row(3, 'student-one', 'Different456'),
        row(4, 'student-four', 'Abcdefg123'),
        row(5, 'bad', 'short'),
        row(6, 'student-six', 'Another123'),
      ],
    })
    expect(result.created.map((item) => item.username)).toEqual(['student-one', 'student-six'])
    expect(result.failed).toHaveLength(3)
    expect(result.failed.map((item) => item.rowNumber)).toEqual([3, 4, 5])
    expect(mocks.createStudentAccount).toHaveBeenCalledTimes(2)
  })

  it('không retry credentials trong cùng batch sau lỗi remote không rõ kết quả', async () => {
    mocks.createStudentAccount.mockRejectedValueOnce(new Error('Mất mạng sau khi gửi'))
    const result = await createStudentsFromRoster({
      classroomId: 'test-class',
      rows: [
        row(2, 'student-one', 'Abcdefg123'),
        row(3, 'student-one', 'OtherPass456'),
      ],
    })
    expect(result.created).toHaveLength(0)
    expect(result.failed).toHaveLength(2)
    expect(mocks.createStudentAccount).toHaveBeenCalledTimes(1)
  })
})
