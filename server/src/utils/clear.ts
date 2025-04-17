import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log("🔄 Clearing database...");

    // Truncate all tables with CASCADE
    await prisma.$executeRaw`TRUNCATE TABLE 
      "StudentDocument",
      "StudentRoom",
      "Room",
      "Floor",
      "EntryExitLog",
      "Inventory",
      "Notice",
      "RoomChangeRequest",
      "Fees",
      "MessComplaint",
      "MessMenu",
      "Attendance",
      "User",
      "Role"
      RESTART IDENTITY CASCADE;`;

    console.log("✅ Database cleared and auto-increment IDs reset.");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();