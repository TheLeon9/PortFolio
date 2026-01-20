import Head from 'next/head';
import '@/styles/variables.scss';
import '@/styles/globals.scss';

import Layout from '@/components/layout';
import { ThemeProvider } from '@/context/ThemeContext.js';

import Logo from 'p/img/logo/logo_fm_white.svg';

const SITE_URL = 'https://port-folio-peach-kappa.vercel.app';
const SITE_TITLE = 'Moracchini Florian - Portfolio';
const SITE_DESCRIPTION =
  'Portfolio interactif 3D de Moracchini Florian - Développeur Full Stack spécialisé en React, Next.js et Three.js';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="shortcut icon" href={Logo.src} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0132b5" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/img/og-image.png`} />
        <meta property="og:locale" content="fr_FR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/img/og-image.png`} />

        {/* Canonical URL */}
        <link rel="canonical" href={SITE_URL} />
      </Head>

      <ThemeProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
