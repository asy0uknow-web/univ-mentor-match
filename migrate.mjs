import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await conn.execute('DESCRIBE mentor_profiles');
  const hasSpecialty = rows.some(r => r.Field === 'specialtyServices');
  
  if (!hasSpecialty) {
    console.log('Adding specialtyServices column...');
    await conn.execute('ALTER TABLE mentor_profiles ADD COLUMN specialtyServices TEXT');
    console.log('✓ specialtyServices column added');
  } else {
    console.log('✓ specialtyServices column already exists');
  }
} finally {
  conn.end();
}
