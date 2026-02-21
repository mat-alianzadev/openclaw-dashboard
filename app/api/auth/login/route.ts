import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "openclaw-secret")

// Simple in-memory user store (in production, use a database)
const users = [
  {
    username: "admin",
    passwordHash: "$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // bcrypt hash of "admin123"
  },
]

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // For demo purposes, accept admin/admin123
    if (username === "admin" && password === "admin123") {
      const token = await new SignJWT({ username, role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET)

      const response = NextResponse.json({ success: true })
      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: false, // Disabled for internal network HTTP access
        sameSite: "lax",
        maxAge: 86400, // 24 hours
        path: "/",
      })

      return response
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
