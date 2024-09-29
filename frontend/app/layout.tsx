import { ThemeProvider } from "@/components/theme-provider"
import Crisp from './crisp'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import './globals.css'
import PlausibleProvider from 'next-plausible'
import Script from "next/script";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AutoSubs',
  description: 'AI video subtitle generator',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="usercentrics-cmp"
          src="https://web.cmp.usercentrics.eu/ui/loader.js"
          data-settings-id="iFQ6TgX4bDPgrf"
          strategy="afterInteractive"
        />
      </head>
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
    </html>
  )
}
