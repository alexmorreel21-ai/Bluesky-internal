type RoutePlaceholderProps = {
  title: string
}

function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <section className="route-panel" aria-label={title}>
      <h1 className="route-title">{title}</h1>
      <p className="route-subtitle">This page is ready for implementation.</p>
    </section>
  )
}

export default RoutePlaceholder