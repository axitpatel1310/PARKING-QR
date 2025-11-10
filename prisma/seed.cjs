require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Settings singleton
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lotLat: parseFloat(process.env.LOT_LAT || "43.6532"),
      lotLng: parseFloat(process.env.LOT_LNG || "-79.3832"),
      geofenceRadiusM: parseInt(process.env.GEOFENCE_RADIUS_M || "100", 10),
      rateCents: Math.round(parseFloat(process.env.BILLING_RATE_PER_HOUR || "10") * 100),
      timezone: process.env.APP_TIMEZONE || "America/Toronto",
    },
  });

  // Admin (single)
  const email = "admin@example.com";
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: passwordHash },
  });

  console.log("Seeded settings + admin:", email, "(password: admin123)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
