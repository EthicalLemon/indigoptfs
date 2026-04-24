
import { HeroSection } from '@/components/home/HeroSection'
import { SearchSection } from '@/components/home/SearchSection'
import { StatsSection } from '@/components/home/StatsSection'
import { DestinationsSection } from '@/components/home/DestinationsSection'
import { FleetPreview } from '@/components/home/FleetPreview'
import { ServicesSection } from '@/components/home/ServicesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { Parallax } from '@/components/ui/Parallax'

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Parallax speed={0.08}>
        <SearchSection />
      </Parallax>

      <Parallax speed={0.12}>
        <StatsSection />
      </Parallax>

      <Parallax speed={0.1}>
        <DestinationsSection />
      </Parallax>

      <Parallax speed={0.15}>
        <FleetPreview />
      </Parallax>

      <Parallax speed={0.1}>
        <ServicesSection />
      </Parallax>

      <Parallax speed={0.08}>
        <TestimonialsSection />
      </Parallax>
    </>
  )
}