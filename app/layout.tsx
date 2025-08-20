import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationProvider } from "@/contexts/notification-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AuthErrorHandler } from "@/components/auth-error-handler"
import { AutoLogoutWrapper } from "@/components/auto-logout-wrapper"
import WhatsappFloat from "@/components/whatsapp-float"
import AnalyticsScript from "@/components/analytics-script"
import { DynamicHead } from "@/components/dynamic-head"
import { AnalyticsTracker } from "@/components/analytics-tracker"
import { OnlinePresenceTracker } from "@/components/online-presence-tracker"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Grupo Central - Baterias e Acessórios Automotivos",
  description: "Grupo Central - Sua loja de baterias e acessórios automotivos de qualidade",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <AuthProvider>
            <NotificationProvider>
              <AuthErrorHandler>
                <AutoLogoutWrapper>
                  <Suspense fallback={null}>
                    <DynamicHead />
                    <AnalyticsTracker />
                    <OnlinePresenceTracker />
                    {children}
                    <WhatsappFloat />
                    <AnalyticsScript />
                  </Suspense>
                </AutoLogoutWrapper>
              </AuthErrorHandler>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
