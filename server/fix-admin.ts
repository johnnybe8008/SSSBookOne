import { getDb } from "./db";
import { users, staff, groups, teams } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Manually fix admin account by creating staff record if missing
 * This can be called via API endpoint to fix existing installations
 */
export async function fixAdminAccount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if user exists
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already has a staff record
  const [existingStaff] = await db
    .select()
    .from(staff)
    .where(eq(staff.userId, userId))
    .limit(1);

  if (existingStaff) {
    return { success: true, message: "Staff record already exists", staff: existingStaff };
  }

  // Create default group if it doesn't exist
  const [existingGroup] = await db.select().from(groups).limit(1);
  let groupId: number;

  if (!existingGroup) {
    const groupResult = await db.insert(groups).values({
      name: "Default Group",
      description: "Default organizational group",
      createdBy: userId,
      updatedBy: userId,
    });
    groupId = (groupResult as any).insertId;
  } else {
    groupId = existingGroup.id;
  }

  // Create default team if it doesn't exist
  const [existingTeam] = await db
    .select()
    .from(teams)
    .where(eq(teams.groupId, groupId))
    .limit(1);
  let teamId: number;

  if (!existingTeam) {
    const teamResult = await db.insert(teams).values({
      groupId,
      name: "Default Team",
      description: "Default organizational team",
      createdBy: userId,
      updatedBy: userId,
    });
    teamId = (teamResult as any).insertId;
  } else {
    teamId = existingTeam.id;
  }

  // Create staff record
  await db.insert(staff).values({
    teamId,
    userId,
    name: user.name || "Admin",
    email: user.email,
    isAdmin: 1,
    isVipRated: 1,
    createdBy: userId,
    updatedBy: userId,
  });

  return { success: true, message: "Staff record created successfully" };
}
