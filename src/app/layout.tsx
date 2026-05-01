import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/sonner'
import { NotificationProvider } from '@/components/providers/NotificationProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'FridgeMind | Kitchen Intelligence OS',
  description: 'The neural center for your kitchen. Track, Optimize, and Discover.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#050506] text-white antialiased`} suppressHydrationWarning>
        <NotificationProvider>
          <QueryProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster position="top-center" expand={false} richColors />
          </QueryProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
