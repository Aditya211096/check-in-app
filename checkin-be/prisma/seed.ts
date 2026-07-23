import { PrismaClient, GlobalRole, TenantRole, BookingStatus } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  console.log("Seeding database with multi-tenant data...");

  // 1. Create or update Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "varanasi-sunrise-ghat" },
    update: {},
    create: {
      name: "Varanasi Sunrise Ghat",
      slug: "varanasi-sunrise-ghat",
      status: "ACTIVE",
    },
  });
  console.log(`Tenant: ${tenant.name}`);

  // 2. Create or update Property
  let property = await prisma.property.findFirst({
    where: { name: "Sunrise Ghat", tenantId: tenant.id },
  });
  if (!property) {
    property = await prisma.property.create({
      data: {
        name: "Sunrise Ghat",
        address: "Varanasi",
        tenantId: tenant.id,
      },
    });
  }
  console.log(`Property: ${property.name}`);

  // 3. Create or update Room
  let room = await prisma.room.findFirst({
    where: { roomNumber: "101", propertyId: property.id },
  });
  if (!room) {
    room = await prisma.room.create({
      data: {
        roomNumber: "101",
        isDormitory: false,
        bunkCount: 0,
        propertyId: property.id,
      },
    });
  }
  console.log(`Room: ${room.roomNumber}`);

  // 4. Create Super Admin accounts
  const superAdmins = [
    { phoneNumber: "+917073818855", fullName: "Aditya Agarwal" },
    { phoneNumber: "+919807289769", fullName: "Aditya Shubham" },
  ];

  for (const admin of superAdmins) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: admin.phoneNumber },
      update: { fullName: admin.fullName },
      create: { phoneNumber: admin.phoneNumber, fullName: admin.fullName },
    });

    await prisma.userGlobalRole.upsert({
      where: { userId_role: { userId: user.id, role: GlobalRole.SUPER_ADMIN } },
      update: {},
      create: { userId: user.id, role: GlobalRole.SUPER_ADMIN },
    });
    console.log(`Super Admin: ${user.fullName}`);
  }

  // 5. Create Tenant User Accounts
  const tenantUsers = [
    { phoneNumber: "+918586816812", fullName: "Yash Sharma", role: TenantRole.PROPERTY_ADMIN },
    { phoneNumber: "+919553765525", fullName: "Aditya Staff", role: TenantRole.STAFF },
    { phoneNumber: "+919660397475", fullName: "Ayushi Aggarwal", role: TenantRole.CUSTOMER },
    { phoneNumber: "+919810495179", fullName: "Sudhir Agarwal", role: TenantRole.CUSTOMER },
  ];

  for (const tUser of tenantUsers) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: tUser.phoneNumber },
      update: { fullName: tUser.fullName },
      create: { phoneNumber: tUser.phoneNumber, fullName: tUser.fullName },
    });

    await prisma.userRoleTenant.upsert({
      where: { userId_tenantId_role: { userId: user.id, tenantId: tenant.id, role: tUser.role } },
      update: {},
      create: { userId: user.id, tenantId: tenant.id, role: tUser.role },
    });
    console.log(`Tenant User: ${user.fullName} -> ${tUser.role}`);
  }

  // 6. Create Default Booking bk-001
  const customerUser = await prisma.user.findUnique({
    where: { phoneNumber: "+919660397475" },
  });

  if (customerUser) {
    const existingBooking = await prisma.booking.findFirst({
      where: { guestId: customerUser.id, tenantId: tenant.id },
    });
    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          id: "bk-001",
          guestId: customerUser.id,
          tenantId: tenant.id,
          propertyId: property.id,
          roomId: room.id,
          status: BookingStatus.CHECKED_IN,
          checkInAt: new Date(),
          checkOutAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        },
      });
      console.log(`Booking bk-001 created`);
    }
  }

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
