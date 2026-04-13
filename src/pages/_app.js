//=============================================================================
// _app — Next.js global wrapper (Head, ThemeProvider, Layout)
//
// Every Next.js page passes through this file. We use it to:
//   • inject global SEO/OG/Twitter meta tags
//   • mount the global ThemeProvider
//   • wrap the page in the Layout (which owns the 3D scene)
//=============================================================================

//-- Imports ------------------------------------------------------------------

// Next.js helper that lets us write into the document <head> from any page.
import Head from 'next/head';

// Top-level layout that mounts the Three.js scene + the floating UI.
import Layout from '@/components/layout';

// Global theme/scroll/audio context provider.
import { ThemeProvider } from '@/context/ThemeContext.js';

// Brand favicon served from /public.
import Logo from 'p/img/logo/logo_fm_white.svg';

// Self-hosted Google Fonts via next/font — eliminates the render-blocking
// stylesheet request to fonts.googleapis.com.
import { Orbitron, Nunito } from 'next/font/google';

// Global stylesheets — `variables` first so the rules in `globals` can use them.
import '@/styles/variables.scss';
import '@/styles/globals.scss';

//-- Font instances ------------------------------------------------------------
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-orbitron',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-nunito',
});

//-- Constants ----------------------------------------------------------------

// Canonical URL of the production site (used by OG / Twitter / canonical link).
const SITE_URL = 'https://port-folio-peach-kappa.vercel.app';

// Browser tab title and OG title.
const SITE_TITLE = 'Moracchini Florian - Portfolio';

// Long-form description used by SEO + social previews.
const SITE_DESCRIPTION =
  'Portfolio interactif 3D de Moracchini Florian - Développeur Full Stack spécialisé en React, Next.js et Three.js';

/**
 * MyApp
 * Standard Next.js custom App. Wraps every page in the providers and the
 * Layout, plus injects the global head metadata.
 */
function MyApp({ Component, pageProps }) {
  //-- Render -----------------------------------------------------------------
  return (
    <div className={`${orbitron.variable} ${nunito.variable}`}>
      <Head>
        {/* Standard tags */}
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta charSet="UTF-8" />
        <link rel="shortcut icon" href={Logo.src} />
        <meta name="robots" content="index, follow" />
        {/* Mobile browser chrome colour. */}
        <meta name="theme-color" content="#0132b5" />

        {/* Open Graph (Facebook, LinkedIn, ...) */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/img/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_FR" />

        {/* Twitter card (large image variant). */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/img/og-image.png`} />

        {/* Canonical URL helps SEO when the site is reachable via several hosts. */}
        <link rel="canonical" href={SITE_URL} />

        {/* JSON-LD schema.org Person — feeds Google's knowledge panel. */}
        <script
          type="application/ld+json"
          // dangerouslySetInnerHTML is the only way to inject raw JSON-LD.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Moracchini Florian',
              url: SITE_URL,
              jobTitle: 'Full Stack Developer',
              knowsAbout: ['React', 'Next.js', 'Three.js', 'JavaScript'],
              sameAs: [
                'https://github.com/TheLeon9',
                'https://www.linkedin.com/in/florian-moracchini/',
              ],
            }),
          }}
        />
      </Head>

      {/* Global providers and the layout that owns the 3D scene. */}
      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </div>
  );
}

export default MyApp;
