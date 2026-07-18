import { PrismaClient, Role, RoomKind, BedStatus } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  console.log("Seeding database with default mock objects...");

  // 1. Create a default Super Admin
  const superAdminPhone = "+919999999999";
  console.log(`Seeding Super Admin with phone: ${superAdminPhone}`);
  await prisma.user.upsert({
    where: { phone: superAdminPhone },
    update: {},
    create: {
      phone: superAdminPhone,
      role: Role.SUPER_ADMIN,
      fullName: "Super Admin Aditya",
    },
  });

  // 2. Create 2 Tenants
  console.log("Creating Tenants...");
  const tenantA = await prisma.tenant.create({
    data: {
      name: "Sunrise Hostels Group",
      plan: "ENTERPRISE",
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: "Kashi Backpackers",
      plan: "STARTER",
    },
  });

  // 3. Create 2 Properties per Tenant
  console.log("Creating Properties...");
  const propA1 = await prisma.property.create({
    data: {
      tenantId: tenantA.id,
      slug: "sunrise-varanasi-ghat",
      name: "Sunrise Ghat Hostel Varanasi",
      city: "Varanasi",
      address: "Assi Ghat, Varanasi, UP",
    },
  });

  const propA2 = await prisma.property.create({
    data: {
      tenantId: tenantA.id,
      slug: "sunrise-rishikesh",
      name: "Sunrise River Hostel Rishikesh",
      city: "Rishikesh",
      address: "Laxman Jhula, Rishikesh, UK",
    },
  });

  const propB1 = await prisma.property.create({
    data: {
      tenantId: tenantB.id,
      slug: "kashi-heritage-inn",
      name: "Kashi Heritage Inn",
      city: "Varanasi",
      address: "Dashashwamedh Ghat, Varanasi, UP",
    },
  });

  const propB2 = await prisma.property.create({
    data: {
      tenantId: tenantB.id,
      slug: "kashi-bodhgaya",
      name: "Kashi Bodhgaya Hostel",
      city: "Bodhgaya",
      address: "Near Mahabodhi Temple, Bodhgaya, Bihar",
    },
  });

  // 4. Create Room Types for Property A1 (Sunrise Ghat Hostel Varanasi)
  console.log("Creating Room Types and Rooms for Sunrise Varanasi Ghat...");
  const typeDorm = await prisma.roomType.create({
    data: {
      tenantId: tenantA.id,
      propertyId: propA1.id,
      name: "6-Bed Deluxe Mixed Dorm",
      kind: RoomKind.DORM,
      basePrice: 800,
    },
  });

  const typePrivate = await prisma.roomType.create({
    data: {
      tenantId: tenantA.id,
      propertyId: propA1.id,
      name: "Premium Private Room",
      kind: RoomKind.PRIVATE,
      basePrice: 2500,
    },
  });

  // Create 2 Dormitory Rooms (each has 3 bunk beds = 6 beds total)
  for (const code of ["D101", "D102"]) {
    const room = await prisma.room.create({
      data: {
        tenantId: tenantA.id,
        roomTypeId: typeDorm.id,
        code,
      },
    });

    // Create 6 beds (3 bunk beds: Upper & Lower)
    for (let b = 1; b <= 3; b++) {
      await prisma.bed.create({
        data: {
          tenantId: tenantA.id,
          roomId: room.id,
          code: `${code}-B${b}-L`,
          status: BedStatus.AVAILABLE,
        },
      });
      await prisma.bed.create({
        data: {
          tenantId: tenantA.id,
          roomId: room.id,
          code: `${code}-B${b}-U`,
          status: BedStatus.AVAILABLE,
        },
      });
    }
  }

  // Create 4 Private Rooms (each has 1 bed)
  for (const code of ["P201", "P202", "P203", "P204"]) {
    const room = await prisma.room.create({
      data: {
        tenantId: tenantA.id,
        roomTypeId: typePrivate.id,
        code,
      },
    });

    await prisma.bed.create({
      data: {
        tenantId: tenantA.id,
        roomId: room.id,
        code: `${code}-Bed`,
        status: BedStatus.AVAILABLE,
      },
    });
  }

  // 5. Create Staff and Managers
  console.log("Creating Staff and Manager users...");
  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      phone: "+918888888888",
      role: Role.MANAGER,
      fullName: "Manager Rajesh",
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenantA.id,
      phone: "+917777777777",
      role: Role.STAFF,
      fullName: "Staff Amit",
    },
  });

  console.log("Database seeded successfully!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
