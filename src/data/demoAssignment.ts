import type { TeacherAssignment } from '../domain/types'

export const demoAssignment: TeacherAssignment = {
  id: 'assignment-supermarket-week-01',
  title: 'Ôn tập Toán thực tế — Mở khóa Siêu thị',
  teacherId: 'teacher-demo-01',
  teacherName: 'Cô Mai',
  grade: 5,
  target: {
    type: 'class',
    classId: 'class-5a-demo',
    className: '5A',
  },
  status: 'published',
  assignedAt: '2026-09-29T08:00:00+07:00',
  stalls: [
    {
      stallId: 'produce',
      challengeIds: ['unlock-produce-001'],
      requiredCorrect: 1,
    },
    {
      stallId: 'food',
      challengeIds: ['unlock-food-001'],
      requiredCorrect: 1,
    },
    {
      stallId: 'drinks',
      challengeIds: ['unlock-drinks-001'],
      requiredCorrect: 1,
    },
    {
      stallId: 'supplies',
      challengeIds: ['unlock-supplies-001'],
      requiredCorrect: 1,
    },
    {
      stallId: 'promotion',
      challengeIds: ['unlock-promotion-001'],
      requiredCorrect: 1,
    },
  ],
  fullShiftEnabled: true,
}
