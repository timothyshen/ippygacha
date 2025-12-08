import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/provider/web3Provider'
import { NotificationProvider } from '@/contexts/notification-context'
import { UserDataProvider } from '@/contexts/user-data-context'

export const metadata: Metadata = {
  title: 'Gacha Machine',
  description: 'Gacha Machine',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NotificationProvider>
            <UserDataProvider>
              {children}
            </UserDataProvider>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  )
}
