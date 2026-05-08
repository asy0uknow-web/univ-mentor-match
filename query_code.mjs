import Database from 'better-sqlite3';
const db = new Database('db.sqlite');
const result = db.prepare('SELECT email, code, expiresAt FROM email_verification_codes WHERE email = ? ORDER BY createdAt DESC LIMIT 1').all('testuser@example.com');
console.log(JSON.stringify(result, null, 2));
db.close();
