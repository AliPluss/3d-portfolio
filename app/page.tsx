import dynamic from 'next/dynamic'

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false })

export default function HomePage() {
  return (
    <main>
      <ThreeScene />
    </main>
  )
}
