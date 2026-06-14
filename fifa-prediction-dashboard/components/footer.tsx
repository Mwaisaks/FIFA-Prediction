export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-pitch-dark px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="font-display text-lg text-gold tracking-wide">WORLD CUP</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Interactive tournament tracker with AI-powered predictions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Tournament Schedule
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Team Rankings
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Live Results
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary">Info</h4>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-text-secondary">
          <p>
            © {currentYear} FIFA World Cup Dashboard. Predictions for entertainment purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
