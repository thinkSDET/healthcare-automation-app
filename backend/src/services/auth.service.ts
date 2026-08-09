import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET || "development-secret";

const NORMAL_TOKEN_EXPIRY = "1h";
const REMEMBER_ME_EXPIRY = "30d";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/* =========================================================
   REGISTER
========================================================= */

export const register = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}) => {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
  } = data;

  const normalizedEmail =
    email.toLowerCase().trim();

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (existingUser) {
    throw new Error(
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 10);

  const user =
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: normalizedEmail,

        // IMPORTANT:
        // Prisma field is passwordHash
        passwordHash,

        role: role as any,
      },
    });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
};

/* =========================================================
   LOGIN
========================================================= */

export const loginUser = async ({
  email,
  password,
  rememberMe = false,
}: LoginInput) => {
  const normalizedEmail =
    email.toLowerCase().trim();

  const user =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  /* =======================================================
     ACCOUNT SECURITY
  ======================================================= */

  let security =
    await prisma.accountSecurity.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (!security) {
    security =
      await prisma.accountSecurity.create({
        data: {
          userId: user.id,
        },
      });
  }

  /* =======================================================
     ACCOUNT LOCK CHECK
  ======================================================= */

  if (
    security.lockedUntil &&
    security.lockedUntil.getTime() >
      Date.now()
  ) {
    const remainingMinutes =
      Math.ceil(
        (security.lockedUntil.getTime() -
          Date.now()) /
          60000
      );

    throw new Error(
      `Account is temporarily locked. Try again in ${remainingMinutes} minute(s).`
    );
  }

  /* =======================================================
     USER STATUS CHECK
  ======================================================= */

  if (user.status === "INACTIVE") {
    throw new Error(
      "Your account is inactive. Please contact support."
    );
  }

  if (user.status === "LOCKED") {
    throw new Error(
      "Your account is locked. Please contact support."
    );
  }

  /* =======================================================
     PASSWORD VALIDATION
  ======================================================= */

  // IMPORTANT:
  // Prisma User model uses passwordHash
  // NOT password

  const passwordValid =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!passwordValid) {
    const attempts =
      security.failedLoginAttempts + 1;

    /* =====================================================
       LOCK ACCOUNT AFTER MAX ATTEMPTS
    ===================================================== */

    if (
      attempts >=
      MAX_LOGIN_ATTEMPTS
    ) {
      const lockedUntil =
        new Date(
          Date.now() +
            LOCK_TIME_MINUTES *
              60 *
              1000
        );

      await prisma.accountSecurity.update(
        {
          where: {
            userId: user.id,
          },

          data: {
            failedLoginAttempts: 0,
            lockedUntil,
          },
        }
      );

      throw new Error(
        `Account locked for ${LOCK_TIME_MINUTES} minutes because of multiple failed login attempts.`
      );
    }

    /* =====================================================
       INCREMENT FAILED ATTEMPTS
    ===================================================== */

    await prisma.accountSecurity.update({
      where: {
        userId: user.id,
      },

      data: {
        failedLoginAttempts:
          attempts,
      },
    });

    throw new Error(
      "Invalid email or password"
    );
  }

  /* =======================================================
     SUCCESSFUL LOGIN
  ======================================================= */

  await prisma.accountSecurity.update({
    where: {
      userId: user.id,
    },

    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  /* =======================================================
     JWT TOKEN
  ======================================================= */

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
      email: user.email,
    },

    JWT_SECRET,

    {
      expiresIn: rememberMe
        ? REMEMBER_ME_EXPIRY
        : NORMAL_TOKEN_EXPIRY,
    }
  );

  return {
    token,

    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },

    expiresIn: rememberMe
      ? REMEMBER_ME_EXPIRY
      : NORMAL_TOKEN_EXPIRY,
  };
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */

export const forgotPassword = async (
  email: string
) => {
  const normalizedEmail =
    email.toLowerCase().trim();

  const user =
    await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

  /*
   * Do not reveal whether the email exists.
   * This prevents account enumeration.
   */

  if (!user) {
    return {
      message:
        "If an account exists with this email, password reset instructions have been sent.",
    };
  }

  /* =======================================================
     GENERATE RESET TOKEN
  ======================================================= */

  const rawToken =
    crypto
      .randomBytes(32)
      .toString("hex");

  const tokenHash =
    crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

  const expiresAt =
    new Date(
      Date.now() +
        15 * 60 * 1000
    );

  /* =======================================================
     REMOVE OLD UNUSED TOKENS
  ======================================================= */

  await prisma.passwordResetToken.deleteMany(
    {
      where: {
        userId: user.id,
        used: false,
      },
    }
  );

  /* =======================================================
     CREATE RESET TOKEN
  ======================================================= */

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  /*
   * Development only.
   * Later replace this with email service.
   */

  console.log(
    `PASSWORD RESET TOKEN for ${user.email}: ${rawToken}`
  );

  return {
    message:
      "If an account exists with this email, password reset instructions have been sent.",

    // Development only
    resetToken: rawToken,
  };
};

/* =========================================================
   RESET PASSWORD
========================================================= */

export const resetPassword = async (
  token: string,
  newPassword: string
) => {
  const tokenHash =
    crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

  const resetToken =
    await prisma.passwordResetToken.findUnique(
      {
        where: {
          tokenHash,
        },
      }
    );

  if (!resetToken) {
    throw new Error(
      "Invalid or expired reset token"
    );
  }

  if (resetToken.used) {
    throw new Error(
      "Reset token has already been used"
    );
  }

  if (
    resetToken.expiresAt.getTime() <
    Date.now()
  ) {
    throw new Error(
      "Invalid or expired reset token"
    );
  }

  /* =======================================================
     HASH NEW PASSWORD
  ======================================================= */

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  /* =======================================================
     UPDATE PASSWORD
  ======================================================= */

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: resetToken.userId,
      },

      data: {
        // IMPORTANT:
        // Prisma field is passwordHash
        passwordHash:
          hashedPassword,
      },
    }),

    prisma.passwordResetToken.update({
      where: {
        id: resetToken.id,
      },

      data: {
        used: true,
      },
    }),

    prisma.accountSecurity.upsert({
      where: {
        userId: resetToken.userId,
      },

      update: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt:
          new Date(),
      },

      create: {
        userId: resetToken.userId,
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangedAt:
          new Date(),
      },
    }),
  ]);

  return {
    message:
      "Password reset successfully",
  };
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!user) {
    throw new Error(
      "User not found"
    );
  }

  /* =======================================================
     CHECK CURRENT PASSWORD
  ======================================================= */

  // IMPORTANT:
  // Prisma field is passwordHash
  // NOT password

  const valid =
    await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

  if (!valid) {
    throw new Error(
      "Current password is incorrect"
    );
  }

  /* =======================================================
     PREVENT SAME PASSWORD
  ======================================================= */

  if (
    currentPassword ===
    newPassword
  ) {
    throw new Error(
      "New password must be different from current password"
    );
  }

  /* =======================================================
     HASH NEW PASSWORD
  ======================================================= */

  const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );

  /* =======================================================
     UPDATE USER PASSWORD
  ======================================================= */

  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      // IMPORTANT:
      // Prisma field is passwordHash
      passwordHash:
        hashedPassword,
    },
  });

  /* =======================================================
     UPDATE SECURITY INFORMATION
  ======================================================= */

  await prisma.accountSecurity.upsert(
    {
      where: {
        userId,
      },

      update: {
        passwordChangedAt:
          new Date(),
      },

      create: {
        userId,
        passwordChangedAt:
          new Date(),
      },
    }
  );

  return {
    message:
      "Password changed successfully",
  };
};