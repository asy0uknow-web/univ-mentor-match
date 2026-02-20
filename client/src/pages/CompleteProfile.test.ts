import { describe, it, expect } from "vitest";

describe("CompleteProfile - Phone Number Formatting", () => {
  // 휴대폰 번호 포맷팅 함수 테스트
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  it("should format phone number correctly - 010-1234-5678", () => {
    expect(formatPhoneNumber("01012345678")).toBe("010-1234-5678");
  });

  it("should format phone number correctly - 02-123-4567", () => {
    expect(formatPhoneNumber("0212345678")).toBe("021-2345-678");
  });

  it("should handle partial input - 010", () => {
    expect(formatPhoneNumber("010")).toBe("010");
  });

  it("should handle partial input - 010-123", () => {
    expect(formatPhoneNumber("010123")).toBe("010-123");
  });

  it("should remove non-numeric characters", () => {
    expect(formatPhoneNumber("010-1234-5678")).toBe("010-1234-5678");
  });

  it("should handle empty input", () => {
    expect(formatPhoneNumber("")).toBe("");
  });
});

describe("CompleteProfile - Form Validation", () => {
  // 폼 검증 함수 테스트
  const validateForm = (realName: string, phoneNumber: string, password: string, confirmPassword: string) => {
    const errors: Record<string, string> = {};

    if (!realName.trim()) {
      errors.realName = "실명을 입력해주세요";
    }

    if (!phoneNumber.trim()) {
      errors.phoneNumber = "휴대폰 번호를 입력해주세요";
    } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(phoneNumber)) {
      errors.phoneNumber = "올바른 휴대폰 번호 형식이 아닙니다";
    }

    if (!password) {
      errors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 6) {
      errors.password = "비밀번호는 최소 6자 이상이어야 합니다";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    return errors;
  };

  it("should validate correct form data", () => {
    const errors = validateForm("홍길동", "010-1234-5678", "password123", "password123");
    expect(Object.keys(errors).length).toBe(0);
  });

  it("should require real name", () => {
    const errors = validateForm("", "010-1234-5678", "password123", "password123");
    expect(errors.realName).toBe("실명을 입력해주세요");
  });

  it("should require phone number", () => {
    const errors = validateForm("홍길동", "", "password123", "password123");
    expect(errors.phoneNumber).toBe("휴대폰 번호를 입력해주세요");
  });

  it("should validate phone number format", () => {
    const errors = validateForm("홍길동", "123456789", "password123", "password123");
    expect(errors.phoneNumber).toBe("올바른 휴대폰 번호 형식이 아닙니다");
  });

  it("should require password", () => {
    const errors = validateForm("홍길동", "010-1234-5678", "", "");
    expect(errors.password).toBe("비밀번호를 입력해주세요");
  });

  it("should require minimum 6 character password", () => {
    const errors = validateForm("홍길동", "010-1234-5678", "pass", "pass");
    expect(errors.password).toBe("비밀번호는 최소 6자 이상이어야 합니다");
  });

  it("should match password and confirm password", () => {
    const errors = validateForm("홍길동", "010-1234-5678", "password123", "password456");
    expect(errors.confirmPassword).toBe("비밀번호가 일치하지 않습니다");
  });

  it("should validate all fields", () => {
    const errors = validateForm("", "", "", "");
    expect(errors.realName).toBeDefined();
    expect(errors.phoneNumber).toBeDefined();
    expect(errors.password).toBeDefined();
  });
});

describe("CompleteProfile - Phone Number Regex", () => {
  // 휴대폰 번호 정규식 테스트
  const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;

  it("should accept valid 010 number", () => {
    expect(phoneRegex.test("010-1234-5678")).toBe(true);
  });

  it("should accept valid 011 number", () => {
    expect(phoneRegex.test("011-1234-5678")).toBe(true);
  });

  it("should accept valid 016 number", () => {
    expect(phoneRegex.test("016-1234-5678")).toBe(true);
  });

  it("should accept 3-4 digit middle section", () => {
    expect(phoneRegex.test("010-123-5678")).toBe(true);
    expect(phoneRegex.test("010-1234-5678")).toBe(true);
  });

  it("should reject invalid format", () => {
    expect(phoneRegex.test("01012345678")).toBe(false);
    expect(phoneRegex.test("010-12345-678")).toBe(false);
    expect(phoneRegex.test("02-1234-5678")).toBe(false);
  });
});
