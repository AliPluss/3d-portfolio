import type { Metadata } from 'next'
import './globals.css'
import Navbar          from '@/components/Navbar'
import CustomCursor    from '@/components/CustomCursor'
import ScrollIndicator from '@/components/ScrollIndicator'

export const metadata: Metadata = {
  title: 'Portfolio — Creative Developer',
  description: 'Personal portfolio. Immersive 3D scenes, selected work, and ideas.',
  openGraph: {
    title:       'Portfolio',
    description: 'Creative developer portfolio with 3D experiences.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <CustomCursor />
        <Navbar />
        {children}
        <ScrollIndicator />
      </body>
    </html>
  )
}
