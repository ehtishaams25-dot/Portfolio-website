export function CurvedMarquee() {
  return (
    <section className="bg-void py-12 text-gold" aria-hidden="true">
      <svg viewBox="0 0 1600 260" className="h-[18vw] min-h-28 w-full overflow-visible">
        <path
          id="marquee-curve"
          d="M -80 185 C 300 20, 620 20, 820 150 S 1300 292, 1680 70"
          fill="none"
        />
        <text className="font-serif text-[92px] italic">
          <textPath href="#marquee-curve" startOffset="0%">
            edit with feeling / motion with memory / story with rhythm / edit with feeling / motion with memory /
          </textPath>
        </text>
      </svg>
    </section>
  )
}
