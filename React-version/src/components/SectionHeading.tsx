type SectionHeadingProps = {
  kicker: string
  title: string
  tone?: 'light' | 'dark'
}

export function SectionHeading({ kicker, title, tone = 'dark' }: SectionHeadingProps) {
  const color = tone === 'light' ? 'text-beige' : 'text-forest'

  return (
    <div className={`reveal mb-12 ${color}`}>
      <p className="ds-kicker mb-4 text-gold">{kicker}</p>
      <h2 className="ds-title">{title}</h2>
    </div>
  )
}
