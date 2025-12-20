import type { Metadata } from 'next'
import { MantineProvider, ColorSchemeScript } from '@mantine/core'
import '@mantine/core/styles.css'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Camp Crew PZ - Server Dashboard',
  description: 'Project Zomboid server statistics and player information',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          {children}
          <Footer />
        </MantineProvider>
      </body>
    </html>
  )
}
