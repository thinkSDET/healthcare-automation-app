import bcrypt from "bcryptjs";

import { prisma } from "../config/prisma";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  "admin@healthcare.local";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  "Admin@12345";

const createAdmin = async () => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email:
          ADMIN_EMAIL.toLowerCase(),
      },
    });

  const passwordHash =
    await bcrypt.hash(
      ADMIN_PASSWORD,
      10
    );

  if (existingUser) {
    const admin =
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          role: "ADMIN" as any,
          passwordHash,
          status: "ACTIVE" as any,
        },
      });

    console.log(
      `Admin account updated: ${admin.email}`
    );

    return;
  }

  const admin =
    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Administrator",
        email:
          ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "ADMIN" as any,
        status: "ACTIVE" as any,
      },
    });

  console.log(
    `Admin account created: ${admin.email}`
  );
};

createAdmin()
  .catch((error) => {
    console.error(
      "Failed to create admin:",
      error
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });