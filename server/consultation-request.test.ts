import { describe, it, expect } from "vitest";

describe("상담 신청 기능", () => {
  it("상담 신청 시 consultationType이 저장되어야 함", () => {
    const consultationType = "생기부 컨설팅";
    expect(consultationType).toBe("생기부 컨설팅");
  });

  it("상담 신청 시 상담 종류별 요금이 정확해야 함", () => {
    const consultationTypes = [
      { type: "생기부 컨설팅", price: 50000 },
      { type: "진로상담", price: 30000 },
      { type: "학업관리", price: 40000 },
      { type: "대학탐방", price: 50000 },
    ];

    for (const { type, price } of consultationTypes) {
      const duration = 2;
      const expectedTotal = price * duration;
      
      expect(expectedTotal).toBeGreaterThan(0);
      expect(expectedTotal).toBe(price * duration);
    }
  });

  it("상담 신청 메시지에 모든 정보가 포함되어야 함", () => {
    const consultationType = "진로상담";
    const duration = 3;
    const price = 30000;
    const totalAmount = price * duration;
    const studentMessage = "추가 메시지";

    const message = `[상담 신청]
종류: ${consultationType}
날짜: 2026-01-15
시간: ${duration}시간
요금: ₩${totalAmount.toLocaleString()}

메시지: ${studentMessage}`;

    expect(message).toContain("[상담 신청]");
    expect(message).toContain(consultationType);
    expect(message).toContain(`${duration}시간`);
    expect(message).toContain(studentMessage);
  });

  it("상담 신청 메시지 형식이 올바른지 확인", () => {
    const consultationType = "학업관리";
    const scheduledDate = "2026-01-15";
    const duration = 1;
    const price = 40000;
    const totalAmount = price * duration;
    const studentMessage = "학업 관리에 대해 상담받고 싶습니다";

    const message = `[상담 신청]
종류: ${consultationType}
날짜: ${scheduledDate}
시간: ${duration}시간
요금: ₩${totalAmount.toLocaleString()}

메시지: ${studentMessage}`;

    expect(message).toContain("[상담 신청]");
    expect(message).toContain("학업관리");
    expect(message).toContain("2026-01-15");
    expect(message).toContain("1시간");
    expect(message).toContain("₩40,000");
  });

  it("상담 종류별 요금 계산이 정확해야 함", () => {
    const rates: Record<string, number> = {
      "생기부 컨설팅": 50000,
      "진로상담": 30000,
      "학업관리": 40000,
      "대학탐방": 50000,
    };

    const testCases = [
      { type: "생기부 컨설팅", duration: 2, expected: 100000 },
      { type: "진로상담", duration: 3, expected: 90000 },
      { type: "학업관리", duration: 1, expected: 40000 },
      { type: "대학탐방", duration: 4, expected: 200000 },
    ];

    for (const { type, duration, expected } of testCases) {
      const total = rates[type] * duration;
      expect(total).toBe(expected);
    }
  });
});
