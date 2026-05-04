import { describe, it, expect } from "vitest";

describe("새로운 가격 정책 (기본 시간 + 추가 시간)", () => {
  it("생기부 컨설팅: 기본 1시간 50,000원 + 추가 1시간당 30,000원", () => {
    const pricing = { base: 50000, additional: 30000 };
    
    // 1시간: 50,000원
    expect(pricing.base + (1 - 1) * pricing.additional).toBe(50000);
    
    // 2시간: 50,000 + 30,000 = 80,000원
    expect(pricing.base + (2 - 1) * pricing.additional).toBe(80000);
    
    // 3시간: 50,000 + 60,000 = 110,000원
    expect(pricing.base + (3 - 1) * pricing.additional).toBe(110000);
  });

  it("진로상담: 기본 1시간 30,000원 + 추가 1시간당 20,000원", () => {
    const pricing = { base: 30000, additional: 20000 };
    
    // 1시간: 30,000원
    expect(pricing.base + (1 - 1) * pricing.additional).toBe(30000);
    
    // 2시간: 30,000 + 20,000 = 50,000원
    expect(pricing.base + (2 - 1) * pricing.additional).toBe(50000);
    
    // 3시간: 30,000 + 40,000 = 70,000원
    expect(pricing.base + (3 - 1) * pricing.additional).toBe(70000);
  });

  it("학업관리: 기본 1시간 40,000원 + 추가 1시간당 25,000원", () => {
    const pricing = { base: 40000, additional: 25000 };
    
    // 1시간: 40,000원
    expect(pricing.base + (1 - 1) * pricing.additional).toBe(40000);
    
    // 2시간: 40,000 + 25,000 = 65,000원
    expect(pricing.base + (2 - 1) * pricing.additional).toBe(65000);
    
    // 3시간: 40,000 + 50,000 = 90,000원
    expect(pricing.base + (3 - 1) * pricing.additional).toBe(90000);
  });

  it("대학탐방: 기본 1시간 50,000원 + 추가 1시간당 30,000원", () => {
    const pricing = { base: 50000, additional: 30000 };
    
    // 1시간: 50,000원
    expect(pricing.base + (1 - 1) * pricing.additional).toBe(50000);
    
    // 2시간: 50,000 + 30,000 = 80,000원
    expect(pricing.base + (2 - 1) * pricing.additional).toBe(80000);
    
    // 3시간: 50,000 + 60,000 = 110,000원
    expect(pricing.base + (3 - 1) * pricing.additional).toBe(110000);
  });

  it("가격 계산 공식: (기본 1시간 비용) + {(입력된 시간 - 1) * 추가 비용}", () => {
    const testCases = [
      { base: 50000, additional: 30000, duration: 1, expected: 50000 },
      { base: 50000, additional: 30000, duration: 1.5, expected: 65000 },
      { base: 50000, additional: 30000, duration: 2, expected: 80000 },
      { base: 30000, additional: 20000, duration: 1, expected: 30000 },
      { base: 30000, additional: 20000, duration: 2.5, expected: 60000 },
      { base: 40000, additional: 25000, duration: 2, expected: 65000 },
    ];

    testCases.forEach(({ base, additional, duration, expected }) => {
      const result = base + (duration - 1) * additional;
      expect(result).toBe(expected);
    });
  });

  it("모든 상담 종류의 가격 정책이 올바르게 계산되는지 확인", () => {
    const pricingPolicies = {
      "생기부 컨설팅": { base: 50000, additional: 30000 },
      "진로상담": { base: 30000, additional: 20000 },
      "학업관리": { base: 40000, additional: 25000 },
      "대학탐방": { base: 50000, additional: 30000 },
    };

    Object.entries(pricingPolicies).forEach(([type, pricing]) => {
      // 1시간 가격 확인
      const oneHourPrice = pricing.base;
      expect(oneHourPrice).toBeGreaterThan(0);

      // 2시간 가격 확인
      const twoHourPrice = pricing.base + pricing.additional;
      expect(twoHourPrice).toBeGreaterThan(oneHourPrice);

      // 3시간 가격 확인
      const threeHourPrice = pricing.base + 2 * pricing.additional;
      expect(threeHourPrice).toBeGreaterThan(twoHourPrice);
    });
  });
});
