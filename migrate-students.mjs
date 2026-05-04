import mysql from 'mysql2/promise';

// UUID 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function migrateStudents() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log('Starting student migration...');

    // 1. 멘토가 아닌 사용자들 조회 (email이 NULL이 아닌 경우)
    const [users] = await connection.query(`
      SELECT u.id, u.name, u.email, u.userType
      FROM users u
      WHERE u.email IS NOT NULL
      AND u.id NOT IN (
        SELECT DISTINCT userId FROM mentor_profiles WHERE isDeleted = false
      )
    `);

    console.log(`Found ${users.length} potential students to migrate`);

    // 2. 각 사용자에 대해 studentProfiles에 데이터 삽입
    let insertedCount = 0;
    for (const user of users) {
      const uuid = generateUUID();
      
      try {
        await connection.query(`
          INSERT INTO student_profiles (uuid, userId, school, grade, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [uuid, user.id, '미등록', '1']);
        
        insertedCount++;
        console.log(`✓ Migrated user ${user.id} (${user.name || 'Unknown'}) with UUID: ${uuid}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⊘ User ${user.id} already exists in student_profiles, skipping...`);
        } else {
          console.error(`✗ Error migrating user ${user.id}:`, error.message);
        }
      }
    }

    console.log(`\nMigration complete! Inserted ${insertedCount} student profiles.`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrateStudents();
