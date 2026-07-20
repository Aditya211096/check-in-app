import { PrismaClient, Role, RoomKind, BedStatus } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  console.log("Seeding database with default mock objects and preset accounts...");

  // 1. Create Preset Accounts
  const presetUsers = [
    { phone: "+917073818855", fullName: "Aditya Agarwal", role: Role.SUPER_ADMIN },
    { phone: "+919807289769", fullName: "Aditya Shubham", role: Role.SUPER_ADMIN },
    { phone: "+918586816812", fullName: "Yash Sharma", role: Role.PROPERTY_OWNER },
    { phone: "+919660397475", fullName: "Ayushi Aggarwal", role: Role.GUEST },
    { phone: "+919553765525", fullName: "Aditya Staff", role: Role.STAFF, subRole: "MAINTENANCE" },
  ];

  for (const user of presetUsers) {
    await prisma.user.upsert({
      where: { phone: user.phone },
      update: { role: user.role, fullName: user.fullName, subRole: (user as any).subRole },
      create: {
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        subRole: (user as any).subRole,
      },
    });
    console.log(`Configured preset user: ${user.fullName} (${user.phone}) -> ${user.role}`);
  }

  // 2. Create 2 Tenants
  console.log("Creating Tenants...");
  let tenantA = await prisma.tenant.findFirst({ where: { name: "Sunrise Hostels Group" } });
  if (!tenantA) {
    tenantA = await prisma.tenant.create({
      data: {
        name: "Sunrise Hostels Group",
        plan: "ENTERPRISE",
      },
    });
  }

  let tenantB = await prisma.tenant.findFirst({ where: { name: "Kashi Backpackers" } });
  if (!tenantB) {
    tenantB = await prisma.tenant.create({
      data: {
        name: "Kashi Backpackers",
        plan: "STARTER",
      },
    });
  }

  // Bind Yash Sharma to Tenant A
  await prisma.user.update({
    where: { phone: "+918586816812" },
    data: { tenantId: tenantA.id },
  });

  // Bind Staff Aditya to Tenant A
  await prisma.user.update({
    where: { phone: "+919553765525" },
    data: { tenantId: tenantA.id },
  });

  console.log("Database seeded successfully!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
