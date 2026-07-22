import { PrismaClient, GlobalRole, TenantRole } from "@prisma/client";

async function main() {
    const prisma = new PrismaClient();
    console.log("Seeding database...");

  const tenant = await prisma.tenant.upsert({
        where: { slug: "varanasi-sunrise-ghat" },
        update: {},
        create: {
                name: "Varanasi Sunrise Ghat",
                slug: "varanasi-sunrise-ghat",
        },
  });
    console.log(`Tenant: ${tenant.name}`);

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

  let room = await prisma.room.findFirst({
        where: { roomNumber: "101", propertyId: property.id },
  });
    if (!room) {
          room = await prisma.room.create({
                  data: {
                            roomNumber: "101",
                            status: "AVAILABLE",
                            propertyId: property.id,
                  },
          });
    }
    console.log(`Room: ${room.roomNumber}`);

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

  const customerUser = await prisma.user.findUnique({
        where: { phoneNumber: "+919660397475" },
  });

  if (customerUser) {
        const existingBooking = await prisma.booking.findFirst({
                where: { phoneNumber: customerUser.phoneNumber, tenantId: tenant.id },
        });
        if (!existingBooking) {
                await prisma.booking.create({
                          data: {
                                      id: "bk-001",
                                      guestName: customerUser.fullName,
                                      phoneNumber: customerUser.phoneNumber,
                                      checkIn: new Date(),
                                      checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                                      status: "CHECKED_IN",
                                      roomId: room.id,
                                      tenantId: tenant.id,
                                      userId: customerUser.id,
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
