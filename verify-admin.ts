import { getDb } from "./server/db";
import { users } from "./drizzle/schema";
import { eq } from "drizzle-orm";

async function verify() {
  const db = await getDb();
  if (!db) {
    console.error("DB not available");
    process.exit(1);
  }

  try {
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.email, "univadmin"))
      .limit(1);

    if (admin.length > 0) {
      console.log("✅ Admin exists:");
      console.log("Email:", admin[0].email);
      console.log("Name:", admin[0].name);
      console.log("Role:", admin[0].role);
      console.log("Has password:", !!admin[0].passwordHash);
    } else {
      console.log("❌ Admin not found");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

verify();
