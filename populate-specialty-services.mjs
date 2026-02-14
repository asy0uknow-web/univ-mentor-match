import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log('Setting default specialtyServices for existing mentors...');
  
  // 모든 멘토에게 기본 specialtyServices 설정 (모든 서비스 포함)
  const defaultServices = JSON.stringify([
    "resume_consulting",
    "career_counseling", 
    "academic_management",
    "university_tour"
  ]);
  
  const [result] = await conn.execute(
    'UPDATE mentor_profiles SET specialtyServices = ? WHERE specialtyServices IS NULL',
    [defaultServices]
  );
  
  console.log(`✓ Updated ${result.affectedRows} mentor profiles with default specialtyServices`);
  
  // 확인
  const [rows] = await conn.execute(
    'SELECT id, major, specialtyServices FROM mentor_profiles WHERE specialtyServices IS NOT NULL LIMIT 3'
  );
  
  console.log('\nSample updated records:');
  rows.forEach(r => {
    console.log(`- ID ${r.id} (${r.major}): ${r.specialtyServices}`);
  });
  
} finally {
  conn.end();
}
