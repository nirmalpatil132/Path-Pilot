import { Button } from '@/components/ui'
import { scrollToId } from '@/lib/scrollToId'

export function FinalCTA() {
  return (
    <section id="final-cta" className="scroll-mt-20 bg-text-primary">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center md:px-8 md:py-28">
        <h2 className="text-h1 text-text-inverse">
          Your career doesn't need another list.
          <br />
          It needs a direction.
        </h2>
        <p className="max-w-xl text-body text-text-inverse/70">
          Understand where you are. Explore where you can go. Know what to do next.
        </p>
        <Button size="lg" onClick={() => scrollToId('how-it-works')}>
          Find My Path
        </Button>
      </div>
    </section>
  )
}
