import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { 
  createMentorProfile, 
  getMentorProfileByUserId, 
  getDb 
} from './db';
import { mentorProfiles } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Mentor Profile Deletion and Re-registration', () => {
  const testUserId = Math.floor(Math.random() * 1000000) + 20000;
  
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

  it('멘토 프로필 생성 후 조회 가능', async () => {
    const profileData = {
      userId: testUserId,
      university: '서울대학교',
      major: '컴퓨터공학과',
      grade: '3',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: '45000',
      bio: '안녕하세요',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(profileData);
    
    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('서울대학교');
  });

  it('멘토 프로필 삭제 후 null 반환', async () => {
    // 먼저 프로필 생성
    const profileData = {
      userId: testUserId,
      university: '연세대학교',
      major: '경영학과',
      grade: '2',
      field: 'business',
      region: 'gyeonggi',
      hourlyRate: '40000',
      bio: '경영학 전공',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(profileData);

    // 프로필 삭제
    const db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId));
    }

    // 삭제 후 조회
    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();
  });

  it('삭제된 프로필 재등록 가능', async () => {
    // 프로필이 없는 상태 확인
    let profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();

    // 새로운 정보로 재등록
    const newProfileData = {
      userId: testUserId,
      university: '고려대학교',
      major: '법학과',
      grade: '4',
      field: 'liberal_arts',
      region: 'incheon',
      hourlyRate: '50000',
      bio: '법학 전공자입니다',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(newProfileData);

    // 재등록 확인
    profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('고려대학교');
    expect(profile?.major).toBe('법학과');
    expect(Number(profile?.hourlyRate)).toBe(50000);
  });

  it('삭제 후 재등록 시 새로운 정보로 업데이트됨', async () => {
    // 초기 프로필 생성
    const initialData = {
      userId: testUserId,
      university: '이화여자대학교',
      major: '화학과',
      grade: '1',
      field: 'natural_science',
      region: 'seoul',
      hourlyRate: '30000',
      bio: '화학 전공',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(initialData);

    // 프로필 삭제
    const db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId));
    }

    // 다른 정보로 재등록
    const updatedData = {
      userId: testUserId,
      university: '카이스트',
      major: '물리학과',
      grade: '3',
      field: 'natural_science',
      region: 'gangwon',
      hourlyRate: '55000',
      bio: '물리학 전공자',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(updatedData);

    // 재등록된 프로필 확인
    const profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.university).toBe('카이스트');
    expect(profile?.major).toBe('물리학과');
    expect(profile?.region).toBe('gangwon');
    expect(Number(profile?.hourlyRate)).toBe(55000);
  });

  it('여러 번 삭제 후 재등록 가능', async () => {
    // 첫 번째 등록
    const data1 = {
      userId: testUserId,
      university: '서강대학교',
      major: '컴퓨터공학과',
      grade: '2',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: '35000',
      bio: '첫 등록',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(data1);
    let profile = await getMentorProfileByUserId(testUserId);
    expect(profile?.bio).toBe('첫 등록');

    // 첫 번째 삭제
    let db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId));
    }

    profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();

    // 두 번째 등록
    const data2 = {
      userId: testUserId,
      university: '중앙대학교',
      major: '전자공학과',
      grade: '3',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: '40000',
      bio: '두 번째 등록',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(data2);
    profile = await getMentorProfileByUserId(testUserId);
    expect(profile?.bio).toBe('두 번째 등록');

    // 두 번째 삭제
    db = await getDb();
    if (db) {
      await db.delete(mentorProfiles)
        .where(eq(mentorProfiles.userId, testUserId));
    }

    profile = await getMentorProfileByUserId(testUserId);
    expect(profile).toBeNull();

    // 세 번째 등록
    const data3 = {
      userId: testUserId,
      university: '홍익대학교',
      major: '산업공학과',
      grade: '4',
      field: 'engineering',
      region: 'seoul',
      hourlyRate: '45000',
      bio: '세 번째 등록',
      verificationStatus: 'pending' as const,
    };

    await createMentorProfile(data3);
    profile = await getMentorProfileByUserId(testUserId);
    expect(profile?.bio).toBe('세 번째 등록');
  });
});
