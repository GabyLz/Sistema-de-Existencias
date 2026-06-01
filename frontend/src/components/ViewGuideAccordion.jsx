export function ViewGuideAccordion({ title = '¿Qué hace esta vista?', description, bullets = [] }) {
  return (
    <details className="view-accordion">
      <summary>{title}</summary>
      <div className="view-accordion-body">
        {description && <p className="mb-2 text-secondary">{description}</p>}
        {bullets.length > 0 && (
          <ul className="mb-0 ps-3 text-secondary">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}