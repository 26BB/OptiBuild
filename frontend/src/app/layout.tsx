import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper"
import { WakeupBanner } from "@/components/layout/WakeupBanner"

export const metadata: Metadata = {
  title: "OptiBuild — Penalty-Aware Construction Scheduling & Resource Optimization",
  description: "SPPU Final Year B.E. System: CPM + Genetic Algorithm RCPSP with MahaRERA Penalty Optimizer",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground blueprint-grid-bg">
        <AuthProvider>
          <WakeupBanner />
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}
