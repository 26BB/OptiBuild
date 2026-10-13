import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/layout/Sidebar"

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
      <body className="min-h-full flex flex-row bg-background text-foreground blueprint-grid-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
