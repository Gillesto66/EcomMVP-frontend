// Auteur : Gilles - Projet : AGC Space - Module : UI - SkipLink
// Accessibilité : lien "Aller au contenu" pour les lecteurs d'écran (WCAG 2.4.1)
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-theme focus:font-medium focus:text-sm"
    >
      Aller au contenu principal
    </a>
  )
}
