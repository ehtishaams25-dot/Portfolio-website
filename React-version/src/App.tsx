import { About } from './components/About'
import { CurvedMarquee } from './components/CurvedMarquee'
import { CustomCursor } from './components/CustomCursor'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { LogoMarquee } from './components/LogoMarquee'
import { RecentWorks } from './components/RecentWorks'
import { Services } from './components/Services'
import { Testimonials } from './components/Testimonials'
import { VideoCarousel } from './components/VideoCarousel'
import { useLenisScroll } from './hooks/useLenisScroll'
import { useRevealAnimations } from './hooks/useRevealAnimations'

function App() {
  useLenisScroll()
  useRevealAnimations()

  return (
    <>
      <CustomCursor />
      <Hero />
      <LogoMarquee />
      <main>
        <About />
        <RecentWorks />
        <Services />
        <VideoCarousel />
        <Testimonials />
        <CurvedMarquee />
      </main>
      <Footer />
    </>
  )
}

export default App
