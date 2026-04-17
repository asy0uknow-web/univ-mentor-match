import mysql from 'mysql2/promise';
import { randomUUID } from 'crypto';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'univmatch',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function seedPublicData() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🌱 Starting public data seeding...\n');

    // 1. 기존 테스트 데이터 정리 (soft delete)
    console.log('📋 Step 1: Identifying and soft-deleting test data...');
    
    const testPatterns = ['test', 'dummy', 'sample', 'fdsf', 'asdf', 'lorem', 'sterostone'];
    
    for (const pattern of testPatterns) {
      await connection.execute(
        `UPDATE mentorProfiles 
         SET isDeleted = true 
         WHERE (bio LIKE ? OR university LIKE ?) 
         AND isDeleted = false`,
        [`%${pattern}%`, `%${pattern}%`]
      );
    }
    
    // 2. 공개용 시드 멘토 생성
    console.log('\n👥 Step 2: Creating seed mentors...\n');
    
    const seedMentors = [
      {
        name: '김서연',
        university: '이화여자대학교',
        major: '컴퓨터공학부',
        grade: '3',
        region: '서울',
        field: '이공계',
        bio: '컴퓨터공학을 고민하는 학생들에게 수업 구성, 과제 강도, 학교 분위기, 진로 준비 과정을 현실적으로 설명해드릴게요. 막연한 이미지보다 실제 수업과 생활 기준으로 이야기하는 상담을 지향합니다.',
        consultationTypes: ['전공 탐색', '진로 상담', '학업관리'],
      },
      {
        name: '정민재',
        university: '고려대학교',
        major: '데이터과학과',
        grade: '4',
        region: '서울',
        field: '이공계',
        bio: '수학·통계에 관심은 있는데 어떤 전공이 맞는지 고민하는 학생들에게 데이터 관련 전공의 실제 수업, 적성, 진로 방향을 쉽게 설명해드립니다.',
        consultationTypes: ['전공 선택', '진로 고민'],
      },
      {
        name: '한지우',
        university: '연세대학교',
        major: '심리학과',
        grade: '3',
        region: '서울',
        field: '인문계',
        bio: '심리학을 막연히 "사람 마음을 배우는 전공"으로 생각하는 경우가 많아요. 실제 수업, 연구, 학교생활을 기준으로 심리학과의 현실을 알려드릴게요.',
        consultationTypes: ['전공 선택', '대학 생활', '학교 분위기'],
      },
      {
        name: '박도현',
        university: '성균관대학교',
        major: '기계공학부',
        grade: '4',
        region: '수원',
        field: '이공계',
        bio: '공대 진학을 고민하는 학생들에게 수업량, 팀플, 전공 적성, 취업 준비 흐름까지 현실적으로 설명해드립니다.',
        consultationTypes: ['공대 생활', '학업관리', '진로 상담'],
      },
      {
        name: '이채린',
        university: '경희대학교',
        major: '호텔관광학과',
        grade: '3',
        region: '서울',
        field: '상경계',
        bio: '호텔관광학과에 대한 막연한 환상보다 실제 커리큘럼, 학교생활, 진로 방향을 솔직하게 들려드리고 싶습니다.',
        consultationTypes: ['대학 생활', '학교 분위기', '전공 현실'],
      },
      {
        name: '최서윤',
        university: '부산대학교',
        major: '전자공학과',
        grade: '4',
        region: '부산',
        field: '이공계',
        bio: '비수도권 공대의 장점과 한계, 대학생활 적응, 진로 준비를 균형 있게 이야기해드릴게요.',
        consultationTypes: ['전공 탐색', '공학 진로'],
      },
    ];

    for (const mentor of seedMentors) {
      // 사용자 생성 (기존 사용자 확인)
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE name = ? AND role = "user" LIMIT 1',
        [mentor.name]
      );

      let userId;
      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        console.log(`✓ Using existing user: ${mentor.name} (ID: ${userId})`);
      } else {
        const openId = randomUUID();
        const [result] = await connection.execute(
          `INSERT INTO users (openId, name, role, userType, createdAt, updatedAt, lastSignedIn)
           VALUES (?, ?, 'user', 'mentor', NOW(), NOW(), NOW())`,
          [openId, mentor.name]
        );
        userId = result.insertId;
        console.log(`✓ Created new user: ${mentor.name} (ID: ${userId})`);
      }

      // 멘토 프로필 생성 또는 업데이트
      const [existingProfiles] = await connection.execute(
        'SELECT id FROM mentorProfiles WHERE userId = ? AND isDeleted = false LIMIT 1',
        [userId]
      );

      const uuid = randomUUID();
      if (existingProfiles.length > 0) {
        // 업데이트
        await connection.execute(
          `UPDATE mentorProfiles 
           SET university = ?, major = ?, grade = ?, region = ?, field = ?, bio = ?, 
               verificationStatus = 'approved', averageRating = 0, reviewCount = 0, updatedAt = NOW()
           WHERE userId = ? AND isDeleted = false`,
          [mentor.university, mentor.major, mentor.grade, mentor.region, mentor.field, mentor.bio, userId]
        );
        console.log(`✓ Updated mentor profile for ${mentor.name}`);
      } else {
        // 생성
        const [result] = await connection.execute(
          `INSERT INTO mentorProfiles 
           (uuid, userId, university, major, grade, region, field, bio, verificationStatus, averageRating, reviewCount, isDeleted, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', 0, 0, false, NOW(), NOW())`,
          [uuid, userId, mentor.university, mentor.major, mentor.grade, mentor.region, mentor.field, mentor.bio]
        );
        console.log(`✓ Created mentor profile for ${mentor.name}`);
      }

      // 상담 유형 설정
      await connection.execute(
        'DELETE FROM mentorConsultationTypes WHERE mentorId = ?',
        [userId]
      );

      for (const type of mentor.consultationTypes) {
        await connection.execute(
          'INSERT INTO mentorConsultationTypes (mentorId, consultationType, createdAt) VALUES (?, ?, NOW())',
          [userId, type]
        );
      }
      console.log(`✓ Set consultation types for ${mentor.name}: ${mentor.consultationTypes.join(', ')}`);
    }

    console.log('\n✅ Public data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await connection.release();
    await pool.end();
  }
}

seedPublicData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
