import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMentorProfile, getMentorProfileByUserId } from './db';
import { getDb } from './db';
import { mentorProfiles } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Mentor Profile Upsert', () => {
  const testUserId = 9999;
  
  beforeAll(async () => {
    // 테스트 시작 전 기존 데이터 정리
    const db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId))
        .catch(() => {});
    }
  });

  afterAll(async () => {
    // 테스트 후 데이터 정리
    const db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId))
        .catch(() => {});
    }
  });

  it('새로운 멘토 프로필 생성', async () => {
    const profile = {
      userId: testUserId,
      university: '테스트대학교',
      major: '컴퓨터공학과',
      year: '1학년',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: 30000,
      bio: '테스트 멘토입니다',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(profile);
    const result = await getMentorProfileByUserId(testUserId);

    expect(result).toBeDefined();
    expect(result?.university).toBe('테스트대학교');
    expect(result?.major).toBe('컴퓨터공학과');
  });

  it('기존 멘토 프로필 업데이트', async () => {
    // 첫 번째 생성
    const profile1 = {
      userId: testUserId,
      university: '테스트대학교',
      major: '컴퓨터공학과',
      year: '1학년',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: 30000,
      bio: '테스트 멘토입니다',
      verificationStatus: 'pending' as const,
    };
    await createMentorProfile(profile1);

    // 두 번째 업데이트 (동일 userId)
    const profile2 = {
      userId: testUserId,
      university: '서울대학교',
      major: '전자공학과',
      year: '2학년',
      field: 'natural_science',
      region: 'gyeonggi',
      hourlyRate: 40000,
      bio: '업데이트된 멘토입니다',
      verificationStatus: 'pending' as const,
    };
    await createMentorProfile(profile2);

    const result = await getMentorProfileByUserId(testUserId);

    expect(result).toBeDefined();
    expect(result?.university).toBe('서울대학교');
    expect(result?.major).toBe('전자공학과');
    expect(Number(result?.hourlyRate)).toBe(40000);
    expect(result?.bio).toBe('업데이트된 멘토입니다');
  });

  it('프로필 삭제 후 재생성', async () => {
    // 첫 번째 생성
    const profile1 = {
      userId: testUserId,
      university: '테스트대학교',
      major: '컴퓨터공학과',
      year: '1학년',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: 30000,
      bio: '테스트 멘토입니다',
      verificationStatus: 'pending' as const,
    };
    await createMentorProfile(profile1);

    // 삭제 (DB에서 직접 삭제)
    const db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId));
    }
    
    let result = await getMentorProfileByUserId(testUserId);
    expect(result).toBeNull();

    // 재생성
    const profile2 = {
      userId: testUserId,
      university: '재생성대학교',
      major: '물리학과',
      year: '3학년',
      field: 'natural_science',
      region: 'incheon',
      hourlyRate: 35000,
      bio: '재생성된 멘토입니다',
      verificationStatus: 'pending' as const,
    };
    await createMentorProfile(profile2);

    result = await getMentorProfileByUserId(testUserId);
    expect(result).toBeDefined();
    expect(result?.university).toBe('재생성대학교');
    expect(result?.major).toBe('물리학과');
  });
});
