export const demoStudentProfile = {
  id: 'student-demo-minh-anh',
  name: 'Minh Anh',
  className: '5A',
  level: 3,
  xp: 120,
  nextLevelXp: 300,
  streakDays: 7,
  title: 'Người mua sắm tập sự',
  skills: [
    { id: 'money', label: 'Tính toán tiền', score: 84 },
    { id: 'unit-price', label: 'Đơn giá', score: 78 },
    { id: 'budget', label: 'Ngân sách', score: 71 },
    { id: 'percentage', label: 'Phần trăm', score: 62 },
  ],
  badges: [
    {
      id: 'first-stall',
      name: 'Gian hàng đầu tiên',
      description: 'Mở khóa gian đầu tiên trong SmartMart.',
    },
    {
      id: 'seven-day-streak',
      name: 'Chuỗi 7 ngày',
      description: 'Học liên tục trong 7 ngày.',
    },
    {
      id: 'smart-shopper',
      name: 'Người mua sắm thông minh',
      description: 'Hoàn thành Mission đầu tiên.',
    },
  ],
}

export const weeklyChallenge = {
  id: 'weekly-smartmart-01',
  title: 'Người mua sắm thông minh',
  subtitle: 'Thử thách tuần · Cùng bộ đề và seed cho cả lớp 5A',
  endsIn: 'Còn 3 ngày',
  rows: [
    { rank: 1, studentId: 'student-thao', name: 'Khánh Thảo', points: 970, accuracy: 96, missions: 3 },
    { rank: 2, studentId: 'student-minh', name: 'Gia Minh', points: 930, accuracy: 94, missions: 3 },
    { rank: 3, studentId: 'student-an', name: 'Hoàng An', points: 895, accuracy: 91, missions: 2 },
    { rank: 4, studentId: 'student-demo-minh-anh', name: 'Minh Anh', points: 860, accuracy: 89, missions: 2 },
    { rank: 5, studentId: 'student-linh', name: 'Ngọc Linh', points: 835, accuracy: 88, missions: 2 },
    { rank: 6, studentId: 'student-nam', name: 'Đức Nam', points: 790, accuracy: 84, missions: 2 },
    { rank: 7, studentId: 'student-huyen', name: 'Thu Huyền', points: 755, accuracy: 82, missions: 1 },
  ],
}
