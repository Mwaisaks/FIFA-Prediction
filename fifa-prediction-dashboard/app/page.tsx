import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { FixturesSection } from '@/components/fixtures-section'
import { PredictorSection } from '@/components/predictor-section'
import { PerformanceSection } from '@/components/performance-section'
import { FaqSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <>
      <Nav />
      <main className="bg-surface">
        <Hero />
        <FixturesSection />
        <PredictorSection />
        <PerformanceSection />
        <FaqSection />
      </main>
      <Footer />
    </>
  )
}
