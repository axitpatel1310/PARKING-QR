require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Settings singleton (id = 1)
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lotLat: 23.0490112,
      lotLng: 72.5221376,
      geofenceRadiusM: 100,
      rateCents: 1000,
      timezone: "America/Toronto",
    },
  });

  // Admin (if you still keep it, else remove)
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: { password: hash },
    create: { email: "admin@example.com", password: hash },
  });

  console.log("Seeded settings + admin: admin@example.com (password: admin123)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
