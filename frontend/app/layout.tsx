import { ThemeProvider } from "@/components/theme-provider"
import Crisp from './crisp'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import './globals.css'
import PlausibleProvider from 'next-plausible'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LongtoShort',
  description: 'AI video subtitle generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="white"
          enableSystem
          disableTransitionOnChange
        >
          <PlausibleProvider
            domain="longtoshort.tech"
            customDomain="https://plausible.longtoshort.tech"
            trackFileDownloads={false}
            trackOutboundLinks={false}
            selfHosted={true}
            enabled={true} />
          <Crisp />
          {children}
        </ThemeProvider>
      </body>
    </html >
  )
}
