# Scenario & Rubric Specification

## 1. Scope

Scenario chỉ thuộc **Employee/Work Mode**.

Unlock Exercise và Mission không dùng rubric này.

## 2. Scenario contract

Mỗi scenario cần:
- id;
- version;
- category/type;
- grade;
- difficulty;
- location/stall;
- mathSkills nếu có;
- context;
- constraints;
- choices;
- bill effects nếu có;
- immediate effects;
- world effects;
- deferred consequences;
- feedback.

## 3. Rubric philosophy

Production không dùng một star score duy nhất để đại diện toàn bộ năng lực.

Tách ít nhất:

### Learning/work performance
- calculation correctness;
- attempts;
- task completion;
- scenario handling.

### Simulation state
- employee rating;
- store reputation;
- customer satisfaction.

### Research dimensions
Có thể lưu dimension score chi tiết theo scenario, ví dụ:
- math;
- budgetFit;
- needFit;
- transparency;
- responsibility;
- waste;
- financialBalance.

Dimension score là dữ liệu phân tích/rubric, không nhất thiết hiển thị trực tiếp cho học sinh.

## 4. Student result UI

Student result production ưu tiên:
- “6/6 phép tính đúng”;
- “2/2 tình huống đã xử lý”;
- “0 hậu quả tiêu cực”;
- badge/XP.

Sau đó mới hiển thị simulation state.

Không để simulation rating 4.3/5 bị hiểu như điểm bài học 4.3/5.

## 5. Employee vs store vs customer

### Employee
Dùng cho:
- calculation accuracy;
- thao tác;
- tư vấn;
- minh bạch;
- quy trình cá nhân.

### Store reputation
Dùng cho:
- chất lượng hàng;
- bảng giá;
- khiếu nại;
- tồn kho/quy trình cửa hàng.

### Customer satisfaction
Phản ánh trải nghiệm của khách trong context hiện tại.

Một quyết định đúng quy trình vẫn có thể khiến customer satisfaction giảm nhẹ; điều đó không đồng nghĩa học sinh làm sai.

## 6. Research storage

Không chỉ lưu final metric.

Mỗi relevant interaction lưu:
- scenarioId/version;
- seed/parameters;
- choice;
- dimension score nếu có;
- response time;
- world state before/after;
- timestamp;
- session/shift id.

Điều này cho phép replay và phân tích pilot.
