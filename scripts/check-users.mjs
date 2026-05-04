import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [users] = await connection.execute('SELECT id, email, name, role FROM users ORDER BY id LIMIT 20');
console.log('=== Users ===');
console.log(JSON.stringify(users, null, 2));

const [mentors] = await connection.execute('SELECT id, user_id, university, major, verification_status FROM mentor_profiles LIMIT 10');
console.log('=== Mentor profiles ===');
console.log(JSON.stringify(mentors, null, 2));

await connection.end();
