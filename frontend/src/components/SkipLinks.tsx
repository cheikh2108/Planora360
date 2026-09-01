'use client';

export function SkipLinks() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>
      <a href="#navigation" className="skip-link">
        Aller à la navigation
      </a>
    </>
  );
}
