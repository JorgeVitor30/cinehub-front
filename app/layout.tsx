import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CineHub",
  description: "Aplicativo de filmes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" />
      </head>
      <body className={`${inter.className} dark bg-background`}>
        <AuthProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem={false} 
            disableTransitionOnChange
            forcedTheme="dark"
            suppressHydrationWarning
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'