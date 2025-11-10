import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

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
    }
  });

  // Admin
  const email = "admin@example.com";
  const pass = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: pass }
  });

  console.log("Seeded settings + admin:", email, "(password: admin123)");
}

main().finally(()=>prisma.$disconnect());
