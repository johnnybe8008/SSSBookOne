import bcrypt from "bcryptjs";
import { getDb } from "./db";
import { users, staff, groups, teams } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Email/Password Authentication Helpers
 */

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(email: string, password: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Find user by email
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return null;
  }

  // Verify password
  if (!user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

export async function createDefaultAdmin() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if default admin already exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@dohbookone.com"))
    .limit(1);

  if (existingAdmin) {
    console.log("Default admin user already exists");
    
    // Check if admin has a staff record
    const [existingStaff] = await db
      .select()
      .from(staff)
      .where(eq(staff.userId, existingAdmin.id))
      .limit(1);
    
    if (!existingStaff) {
      console.log("Admin user exists but has no staff record, creating one...");
      
      // Create default group if it doesn't exist
      const [existingGroup] = await db.select().from(groups).limit(1);
      let groupId: number;
      
      if (!existingGroup) {
        const groupResult = await db.insert(groups).values({
          name: "Default Group",
          description: "Default organizational group",
          createdBy: existingAdmin.id,
          updatedBy: existingAdmin.id,
        });
        groupId = (groupResult as any).insertId;
        console.log("Default group created");
      } else {
        groupId = existingGroup.id;
      }
      
      // Create default team if it doesn't exist
      const [existingTeam] = await db.select().from(teams).where(eq(teams.groupId, groupId)).limit(1);
      let teamId: number;
      
      if (!existingTeam) {
        const teamResult = await db.insert(teams).values({
          groupId,
          name: "Default Team",
          description: "Default organizational team",
          createdBy: existingAdmin.id,
          updatedBy: existingAdmin.id,
        });
        teamId = (teamResult as any).insertId;
        console.log("Default team created");
      } else {
        teamId = existingTeam.id;
      }
      
      // Create staff record for the existing admin user
      await db.insert(staff).values({
        teamId,
        userId: existingAdmin.id,
        name: "Admin",
        email: "admin@dohbookone.com",
        isAdmin: 1,
        isVipRated: 1,
        createdBy: existingAdmin.id,
        updatedBy: existingAdmin.id,
      });
      
      console.log("Staff record created for existing admin user");
    }
    
    return existingAdmin;
  }

  // Create default admin user
  const passwordHash = await hashPassword("password");
  
  const result = await db.insert(users).values({
    email: "admin@dohbookone.com",
    name: "Admin",
    passwordHash,
    loginMethod: "email",
    role: "admin",
    openId: null,
  });

  const insertId = (result as any).insertId;
  
  console.log("Default admin user created: admin@dohbookone.com / password");
  
  // Create default group if it doesn't exist
  const [existingGroup] = await db.select().from(groups).limit(1);
  let groupId: number;
  
  if (!existingGroup) {
    const groupResult = await db.insert(groups).values({
      name: "Default Group",
      description: "Default organizational group",
      createdBy: insertId,
      updatedBy: insertId,
    });
    groupId = (groupResult as any).insertId;
    console.log("Default group created");
  } else {
    groupId = existingGroup.id;
  }
  
  // Create default team if it doesn't exist
  const [existingTeam] = await db.select().from(teams).where(eq(teams.groupId, groupId)).limit(1);
  let teamId: number;
  
  if (!existingTeam) {
    const teamResult = await db.insert(teams).values({
      groupId,
      name: "Default Team",
      description: "Default organizational team",
      createdBy: insertId,
      updatedBy: insertId,
    });
    teamId = (teamResult as any).insertId;
    console.log("Default team created");
  } else {
    teamId = existingTeam.id;
  }
  
  // Create staff record for the admin user
  await db.insert(staff).values({
    teamId,
    userId: insertId,
    name: "Admin",
    email: "admin@dohbookone.com",
    isAdmin: 1,
    isVipRated: 1,
    createdBy: insertId,
    updatedBy: insertId,
  });
  
  console.log("Default admin staff record created");
  
  // Return the created user
  const [newAdmin] = await db.select().from(users).where(eq(users.id, insertId)).limit(1);
  return newAdmin;
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get user
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    throw new Error("User not found");
  }
  
  // Verify current password
  if (!user.passwordHash) {
    throw new Error("No password set for this user");
  }
  
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }
  
  // Hash new password and update, also clear mustChangePassword flag
  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, mustChangePassword: 0 }).where(eq(users.id, userId));
}
