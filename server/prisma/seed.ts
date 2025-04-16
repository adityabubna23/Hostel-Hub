import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Define roles
  const roles = ["Admin", "Warden", "Student", "Accountant", "Staff"];
  
  // Insert roles if not exists
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  // Check if admin exists
  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@hostel.com" },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // Create Admin User
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@hostel.com",
        password: hashedPassword,
        role: {
          connect: { name: "Admin" },
        },
      },
    });

    console.log("✅ Admin user created successfully!");
  } else {
    console.log("⚠️ Admin user already exists.");
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
