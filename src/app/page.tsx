import { HeroSection } from '@/components/home/HeroSection'
import { SearchSection } from '@/components/home/SearchSection'
import { StatsSection } from '@/components/home/StatsSection'
import { DestinationsSection } from '@/components/home/DestinationsSection'
import { FleetPreview } from '@/components/home/FleetPreview'
import { ServicesSection } from '@/components/home/ServicesSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SearchSection />
      <StatsSection />
      <DestinationsSection />
      <FleetPreview />
      <ServicesSection />
      <TestimonialsSection />
    </>
  )
}
