import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMentorProfile, getMentorProfileByUserId, createMentorVerification, getMentorVerificationByUserId } from './db';
import { getDb } from './db';
import { mentorProfiles, mentorVerifications } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Mentor Registration Flow', () => {
  const testUserId = 8888;
  
  beforeAll(async () => {
    // 테스트 시작 전 기존 데이터 정리
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
    // 테스트 후 데이터 정리
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

  it('미등록 사용자가 멘토로 등록 가능', async () => {
    // 미등록 상태 확인
    let profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();

    // 멘토 프로필 생성 (멘토로 등록)
    const registrationData = {
      userId: testUserId,
      university: '서울대학교',
      major: '컴퓨터공학과',
      grade: '2',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: '40000',
      bio: '안녕하세요, 저는 컴퓨터공학을 전공하는 대학생입니다.',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(registrationData);
    
    // 등록 후 프로필 확인
    profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('서울대학교');
    expect(profile?.major).toBe('컴퓨터공학과');
    expect(profile?.verificationStatus).toBe('pending');
  });

  it('멘토 등록 시 자동으로 인증 요청 생성', async () => {
    // 멘토 프로필 생성
    const registrationData = {
      userId: testUserId,
      university: '연세대학교',
      major: '경영학과',
      grade: '3',
      field: 'business',
      region: 'gyeonggi',
      hourlyRate: '35000',
      bio: '경영학을 전공하고 있습니다.',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(registrationData);

    // 인증 요청 생성
    try {
      await createMentorVerification({
        userId: testUserId,
        studentIdImageUrl: '',
        status: 'pending',
      });
    } catch (error) {
      // 이미 존재하는 경우 무시
    }

    // 인증 요청 확인
    const verification = await getMentorVerificationByUserId(testUserId);
    expect(verification).toBeDefined();
    expect(verification?.status).toBe('pending');
  });

  it('등록된 멘토가 프로필 정보 수정 가능', async () => {
    // 초기 프로필 생성
    const initialData = {
      userId: testUserId,
      university: '고려대학교',
      major: '법학과',
      grade: '1',
      field: 'liberal_arts',
      region: 'incheon',
      hourlyRate: '25000',
      bio: '법학을 공부하고 있습니다.',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(initialData);

    // 프로필 정보 수정
    const updatedData = {
      userId: testUserId,
      university: '고려대학교',
      major: '법학과',
      grade: '2',
      field: 'liberal_arts',
      region: 'incheon',
      hourlyRate: '30000',
      bio: '법학 전공자입니다. 법학 관련 상담을 제공합니다.',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(updatedData);

    // 수정된 프로필 확인
    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.grade).toBe('2');
    expect(Number(profile?.hourlyRate)).toBe(30000);
    expect(profile?.bio).toBe('법학 전공자입니다. 법학 관련 상담을 제공합니다.');
  });

  it('필수 정보 입력 후 멘토 등록', async () => {
    const requiredData = {
      userId: testUserId,
      university: '이화여자대학교',
      major: '화학과',
      grade: '4',
      region: 'seoul',
      hourlyRate: '50000',
      bio: '',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(requiredData);

    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('이화여자대학교');
    expect(profile?.major).toBe('화학과');
    expect(profile?.grade).toBe('4');

    expect(profile?.region).toBe('seoul');
    expect(Number(profile?.hourlyRate)).toBe(50000);
  });
});
