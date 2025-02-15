import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";

// Validasi environment variable
if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not set. Using a fallback secret.");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string, role: string) {
  if (!userId || !role) {
    throw new Error("User ID dan Role harus disediakan");
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "fallback_secret_dev_only",
    {
      expiresIn: "8h",
      algorithm: "HS256",
    }
  );
}

export async function validateToken(token: string) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_dev_only",
      { algorithms: ["HS256"] }
    );
    return decoded as { id: string; role: string };
  } catch (error) {
    console.error("Token validation error:", error);
    return null;
  }
}

export async function getUserFromToken(token: string) {
  try {
    const decoded = await validateToken(token);
    if (!decoded) return null;

    return prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}
