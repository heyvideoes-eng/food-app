import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/sonner'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import BackgroundCanvas from '@/components/canvas/BackgroundCanvas'
import CustomCursor from '@/components/ui/CustomCursor'
import { NotificationProvider } from '@/components/providers/NotificationProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'FridgeMind | Future of Food Management',
  description: 'AI-powered fridge tracker to reduce food waste with a cinematic experience',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-foreground`} suppressHydrationWarning>
        <SmoothScrollProvider>
          <NotificationProvider>
            <QueryProvider>
              <CustomCursor />
              <BackgroundCanvas />
              <AppShell>
                {children}
              </AppShell>
              <Toaster />
            </QueryProvider>
          </NotificationProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
