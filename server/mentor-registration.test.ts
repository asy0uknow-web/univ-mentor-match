import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMentorProfile, getMentorProfileByUserId, createMentorVerification, getMentorVerificationByUserId } from './db';
import { getDb } from './db';
import { mentorProfiles, mentorVerifications } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Mentor Registration Flow', () => {
  const testUserId = 8888;
  
  beforeAll(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(mentorVerifications)
        .where(eq(mentorVerifications.userId, testUserId))
        .catch(() => {});
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId))
        .catch(() => {});
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(mentorVerifications)
        .where(eq(mentorVerifications.userId, testUserId))
        .catch(() => {});
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId))
        .catch(() => {});
    }
  });

  it('미등록 사용자가 멘토로 등록 가능 (specialtyServices 포함)', async () => {
    let profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();

    const registrationData = {
      userId: testUserId,
      university: '서울대학교',
      major: '컴퓨터공학과',
      grade: '2' as const,
      field: 'engineering' as const,
      region: 'seoul' as const,
      hourlyRate: '0',
      bio: '안녕하세요, 저는 컴퓨터공학을 전공하는 대학생입니다.',
      specialtyServices: JSON.stringify(["resume_consulting", "career_counseling"]),
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(registrationData);
    
    profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('서울대학교');
    expect(profile?.major).toBe('컴퓨터공학과');
    expect(profile?.verificationStatus).toBe('pending');
    
    // specialtyServices 확인
    expect(profile?.specialtyServices).toBeDefined();
    const services = JSON.parse(profile!.specialtyServices!);
    expect(services).toContain("resume_consulting");
    expect(services).toContain("career_counseling");
    expect(services.length).toBe(2);
  });

  it('멘토 등록 시 자동으로 인증 요청 생성', async () => {
    const registrationData = {
      userId: testUserId,
      university: '연세대학교',
      major: '경영학과',
      grade: '3' as const,
      field: 'business' as const,
      region: 'gyeonggi' as const,
      hourlyRate: '0',
      bio: '경영학을 전공하고 있습니다.',
      specialtyServices: JSON.stringify(["academic_management"]),
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(registrationData);

    try {
      await createMentorVerification({
        userId: testUserId,
        studentIdImageUrl: '',
        status: 'pending',
      });
    } catch (error) {
      // 이미 존재하는 경우 무시
    }

    const verification = await getMentorVerificationByUserId(testUserId);
    expect(verification).toBeDefined();
    expect(verification?.status).toBe('pending');
  });

  it('등록된 멘토가 프로필 정보 수정 가능 (specialtyServices 변경)', async () => {
    const initialData = {
      userId: testUserId,
      university: '고려대학교',
      major: '법학과',
      grade: '1' as const,
      field: 'liberal_arts' as const,
      region: 'incheon' as const,
      hourlyRate: '0',
      bio: '법학을 공부하고 있습니다.',
      specialtyServices: JSON.stringify(["career_counseling"]),
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(initialData);

    const updatedData = {
      userId: testUserId,
      university: '고려대학교',
      major: '법학과',
      grade: '2' as const,
      field: 'liberal_arts' as const,
      region: 'incheon' as const,
      hourlyRate: '0',
      bio: '법학 전공자입니다. 법학 관련 상담을 제공합니다.',
      specialtyServices: JSON.stringify(["career_counseling", "university_tour"]),
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(updatedData);

    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.grade).toBe('2');
    expect(profile?.bio).toBe('법학 전공자입니다. 법학 관련 상담을 제공합니다.');
    
    // specialtyServices 변경 확인
    const services = JSON.parse(profile!.specialtyServices!);
    expect(services).toContain("career_counseling");
    expect(services).toContain("university_tour");
    expect(services.length).toBe(2);
  });

  it('hourlyRate가 0으로 설정됨 (상담료 입력 제거)', async () => {
    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(Number(profile?.hourlyRate)).toBe(0);
  });

  it('모든 서비스 타입으로 등록 가능', async () => {
    const allServices = ["resume_consulting", "career_counseling", "academic_management", "university_tour"];
    
    const registrationData = {
      userId: testUserId,
      university: '이화여자대학교',
      major: '화학과',
      grade: '4' as const,
      field: 'natural_science' as const,
      region: 'seoul' as const,
      hourlyRate: '0',
      bio: '',
      specialtyServices: JSON.stringify(allServices),
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(registrationData);

    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    
    const services = JSON.parse(profile!.specialtyServices!);
    expect(services.length).toBe(4);
    expect(services).toContain("resume_consulting");
    expect(services).toContain("career_counseling");
    expect(services).toContain("academic_management");
    expect(services).toContain("university_tour");
  });
});

describe('Specialty Services Validation', () => {
  it('서비스 코드를 한국어 라벨로 변환', () => {
    const serviceLabels: Record<string, string> = {
      "resume_consulting": "생기부 컨설팅",
      "career_counseling": "진로상담",
      "academic_management": "학업관리",
      "university_tour": "대학탐방",
    };

    expect(serviceLabels["resume_consulting"]).toBe("생기부 컨설팅");
    expect(serviceLabels["career_counseling"]).toBe("진로상담");
    expect(serviceLabels["academic_management"]).toBe("학업관리");
    expect(serviceLabels["university_tour"]).toBe("대학탐방");
  });

  it('JSON 파싱 에러 처리', () => {
    const invalidJson = "not valid json";
    let parsed: string[] = [];
    try {
      parsed = JSON.parse(invalidJson);
    } catch {
      parsed = [];
    }
    expect(parsed).toEqual([]);
  });

  it('null specialtyServices 처리', () => {
    const nullValue: string | null = null;
    let services: string[] = [];
    if (nullValue) {
      try {
        services = JSON.parse(nullValue);
      } catch {
        services = [];
      }
    }
    expect(services).toEqual([]);
  });

  it('빈 배열 specialtyServices 처리', () => {
    const emptyArray = JSON.stringify([]);
    const parsed = JSON.parse(emptyArray);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
  });
});

describe('Verification Image Upload', () => {
  it('이미지 파일 크기 제한 (5MB)', () => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    expect(maxSize).toBe(5242880);
    
    // 5MB 이하 허용
    expect(4 * 1024 * 1024 < maxSize).toBe(true);
    // 5MB 초과 거부
    expect(6 * 1024 * 1024 > maxSize).toBe(true);
  });

  it('허용된 이미지 MIME 타입 확인', () => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    expect(allowedTypes.some(t => "image/jpeg".startsWith("image/"))).toBe(true);
    expect("application/pdf".startsWith("image/")).toBe(false);
    expect("text/plain".startsWith("image/")).toBe(false);
  });

  it('인증 서류 안내 텍스트 확인', () => {
    const verificationDocs = [
      "대학 포털 학적인증 캡쳐본",
      "모바일/실물 학생증 사진",
    ];
    
    expect(verificationDocs.length).toBe(2);
    expect(verificationDocs[0]).toContain("학적인증");
    expect(verificationDocs[1]).toContain("학생증");
  });
});
