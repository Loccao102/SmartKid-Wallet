# Scenario & Rubric Specification

## 1. Scenario contract
Mọi content có thể chấm phải có:
- id
- version
- type
- grade
- difficulty
- location/stall
- mathSkills
- values
- prompt/context
- parameters
- constraints
- answer model
- rubric
- effects
- feedback

## 2. Rubric philosophy
UI học sinh dùng 1–5 sao. Backend lưu dimension score chi tiết.

Ví dụ Customer Budget:
- math: 0–4
- budgetFit: 0–2
- needFit: 0–2
- responsibility: 0–2
Tổng raw: 0–10 rồi map sang star rating.

Gợi ý mapping mặc định:
- 9.0–10.0 → 5 sao
- 7.5–8.9 → 4 sao
- 6.0–7.4 → 3 sao
- 4.0–5.9 → 2 sao
- <4.0 → 1 sao

Mapping có thể override theo scenario type.

## 3. Employee vs store
### Employee effect
Dùng cho:
- tính sai;
- không nghe yêu cầu khách;
- trả tiền thừa sai;
- tư vấn kém;
- xử lý minh bạch tốt.

### Store reputation effect
Dùng cho:
- hàng dập/hỏng trên kệ;
- hàng gần hết hạn bị che giấu;
- bảng giá sai;
- khiếu nại;
- chất lượng/quy trình của siêu thị.

Một scenario có thể ảnh hưởng cả hai với trọng số khác nhau.

## 4. Example
```json
{
  "id": "SUP-PRODUCE-DAMAGED-001",
  "version": 1,
  "type": "quality_decision",
  "grade": 5,
  "difficulty": 2,
  "stallId": "produce",
  "mathSkills": ["percentage", "multiplication"],
  "values": ["honesty", "responsibility", "waste_reduction"],
  "rubric": {
    "math": 4,
    "transparency": 2,
    "customerFit": 1,
    "waste": 2,
    "financialBalance": 1
  }
}
```

## 5. Research storage
Không chỉ lưu final stars. Mỗi attempt phải lưu tối thiểu:
- scenarioId + version;
- random seed/parameters;
- answer;
- choice;
- dimension scores;
- response time;
- world state trước/sau;
- timestamp;
- session/shift id.

Điều này cho phép replay và phân tích sau pilot.
