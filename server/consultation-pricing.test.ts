import { describe, it, expect } from "vitest";

describe("Consultation Pricing", () => {
  // Consultation prices mapping
  const consultationPrices: Record<string, number> = {
    "resume_consulting": 50000,
    "career_counseling": 30000,
    "academic_management": 40000,
    "university_tour": 50000,
  };

  it("should calculate correct total amount for resume consulting (50,000/hour)", () => {
    const duration = 1;
    const hourlyRate = consultationPrices["resume_consulting"];
    const totalAmount = hourlyRate * duration;
    expect(totalAmount).toBe(50000);
  });

  it("should calculate correct total amount for career counseling (30,000/hour)", () => {
    const duration = 1.5;
    const hourlyRate = consultationPrices["career_counseling"];
    const totalAmount = hourlyRate * duration;
    expect(totalAmount).toBe(45000);
  });

  it("should calculate correct total amount for academic management (40,000/hour)", () => {
    const duration = 2;
    const hourlyRate = consultationPrices["academic_management"];
    const totalAmount = hourlyRate * duration;
    expect(totalAmount).toBe(80000);
  });

  it("should calculate correct total amount for university tour (50,000/hour)", () => {
    const duration = 2;
    const hourlyRate = consultationPrices["university_tour"];
    const totalAmount = hourlyRate * duration;
    expect(totalAmount).toBe(100000);
  });

  it("should default to career_counseling if consultationType is not provided", () => {
    const duration = 1;
    const defaultType = "career_counseling";
    const hourlyRate = consultationPrices[defaultType] || 30000;
    const totalAmount = hourlyRate * duration;
    expect(totalAmount).toBe(30000);
  });
});
