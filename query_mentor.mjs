import { drizzle } from 'drizzle-orm/mysql2/driver';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema });

const result = await connection.query(`
  SELECT 
    u.id,
    u.name,
    u.userType,
    mp.id as mentorProfileId,
    mp.userId,
    mp.university,
    mp.major,
    mp.year,
    mp.bio,
    mp.field,
    mp.region,
    mp.isActive,
    mp.verificationStatus,
    mp.averageRating,
    mp.createdAt,
    mp.updatedAt
  FROM users u
  LEFT JOIN mentor_profiles mp ON u.id = mp.userId
  WHERE u.name = '2003yunho'
  ORDER BY mp.id
`);

console.log(JSON.stringify(result[0], null, 2));
process.exit(0);
