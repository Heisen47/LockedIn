import { Github, Twitter, Linkedin, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-linear-to-br from-cyan-400 to-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.5)]"></span>
              <span className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-100">
                LockedIn
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Where builders ship, share, and connect. Showcase your projects and get feedback from the community.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Platform
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="/"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/index"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Feed
                </a>
              </li>
              <li>
                <a
                  href="/building"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Building
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Resources
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  API Reference
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Connect
            </h3>
            <ul className="mb-6 space-y-2.5">
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-slate-400 transition-colors hover:text-cyan-400"
                >
                  Terms of Service
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Heisen47/LockedIn"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-slate-700/60 hover:text-cyan-400"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-slate-700/60 hover:text-cyan-400"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-slate-700/60 hover:text-cyan-400"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@lockedin.dev"
                className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-2 text-slate-400 transition-all hover:border-slate-700/60 hover:text-cyan-400"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-800/50 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {currentYear} LockedIn. Built by builders, for builders.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-xs text-slate-500 transition-colors hover:text-slate-400"
              >
                Status
              </a>
              <span className="h-1 w-1 rounded-full bg-slate-700"></span>
              <a
                href="#"
                className="text-xs text-slate-500 transition-colors hover:text-slate-400"
              >
                Changelog
              </a>
              <span className="h-1 w-1 rounded-full bg-slate-700"></span>
              <a
                href="#"
                className="text-xs text-slate-500 transition-colors hover:text-slate-400"
              >
                Blog
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
