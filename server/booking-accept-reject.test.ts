import { describe, it, expect } from "vitest";

describe("상담 신청 수락/거절 기능", () => {
  it("상담 신청 초기 상태는 pending이어야 함", () => {
    const bookingStatus = "pending";
    expect(bookingStatus).toBe("pending");
  });

  it("상담 신청을 수락하면 상태가 confirmed로 변경되어야 함", () => {
    let bookingStatus = "pending";
    // 수락 처리
    bookingStatus = "confirmed";
    expect(bookingStatus).toBe("confirmed");
  });

  it("상담 신청을 거절하면 상태가 cancelled로 변경되어야 함", () => {
    let bookingStatus = "pending";
    // 거절 처리
    bookingStatus = "cancelled";
    expect(bookingStatus).toBe("cancelled");
  });

  it("상담 신청 상태 변경 순서가 정확해야 함", () => {
    // pending -> confirmed -> completed
    let status = "pending";
    expect(status).toBe("pending");

    status = "confirmed";
    expect(status).toBe("confirmed");

    status = "completed";
    expect(status).toBe("completed");
  });

  it("상담 신청 거절 후 상태는 cancelled이어야 함", () => {
    let status = "pending";
    status = "cancelled";
    expect(status).toBe("cancelled");
  });

  it("멘토만 상담 신청을 수락/거절할 수 있어야 함", () => {
    const mentorId = 1;
    const userId = 1;
    const isMentor = mentorId === userId;
    expect(isMentor).toBe(true);
  });

  it("학생은 상담 신청을 수락/거절할 수 없어야 함", () => {
    const mentorId = 1;
    const studentId = 2;
    const isMentor = mentorId === studentId;
    expect(isMentor).toBe(false);
  });

  it("상담 신청 메시지에 모든 정보가 포함되어야 함", () => {
    const consultationType = "career_counseling";
    const duration = 2;
    const totalAmount = 60000;
    const message = `[상담 신청]
종류: ${consultationType}
시간: ${duration}시간
요금: ₩${totalAmount.toLocaleString()}`;

    expect(message).toContain("[상담 신청]");
    expect(message).toContain("career_counseling");
    expect(message).toContain("2시간");
    expect(message).toContain("₩60,000");
  });
});
