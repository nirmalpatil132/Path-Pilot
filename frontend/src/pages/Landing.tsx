import { CareerPreview } from '@/components/landing/CareerPreview'
import { ExplainableFit } from '@/components/landing/ExplainableFit'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { ProgressPreview } from '@/components/landing/ProgressPreview'
import { PublicNavbar } from '@/components/landing/PublicNavbar'
import { SkillGapPreview } from '@/components/landing/SkillGapPreview'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <CareerPreview />
        <ExplainableFit />
        <SkillGapPreview />
        <ProgressPreview />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
