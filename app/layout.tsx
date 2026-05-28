import type { Metadata } from 'next'
import './globals.css'
// Self-hosted fonts — loaded once, no Google Fonts network request
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/400-italic.css'
import '@fontsource/playfair-display/500.css'
import '@fontsource/playfair-display/600.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/playfair-display/700-italic.css'
import '@fontsource/playfair-display/900.css'
import '@fontsource/playfair-display/900-italic.css'
import Navbar                  from '@/components/Navbar'
import CustomCursor            from '@/components/CustomCursor'
import ScrollIndicator         from '@/components/ScrollIndicator'
import PageTransitionOverlay   from '@/components/PageTransitionOverlay'
import Providers               from '@/components/providers'
import Footer                  from '@/components/Footer'

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
        <Providers>
          <PageTransitionOverlay>
            <CustomCursor />
            <Navbar />
            {children}
            <Footer />
            <ScrollIndicator />
          </PageTransitionOverlay>
        </Providers>
      </body>
    </html>
  )
}
