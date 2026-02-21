import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { jwtVerify } from "jose"
import DashboardLayout from "@/components/dashboard-layout"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    redirect("/login")
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "openclaw-secret")
    await jwtVerify(token.value, secret)
  } catch {
    redirect("/login")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
