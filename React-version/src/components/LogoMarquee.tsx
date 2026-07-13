export function LogoMarquee() {
  const logos = Array.from({ length: 12 }, (_, index) => index)

  return (
    <section className="bg-forest py-8 text-beige" aria-label="Selected client logos">
      <div className="marquee-mask overflow-hidden">
        <div className="marquee-track flex w-max items-center gap-14">
          {[...logos, ...logos].map((item, index) => (
            <img
              key={`${item}-${index}`}
              src="/assets/logos/client-logo.png"
              alt=""
              className="h-10 w-auto opacity-80"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
