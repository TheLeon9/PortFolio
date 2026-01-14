import Head from 'next/head';
import '@/styles/variables.scss';
import '@/styles/globals.scss';

import Layout from '@/components/layout';
import { ThemeProvider } from '@/context/ThemeContext.js';

import Logo from 'p/img/logo/logo_fm_white.svg';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Moracchini Florian</title>
        <meta
          name="description"
          content="Moracchini Florian - My Personal Portfolio"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <link rel="shortcut icon" href={Logo.src} />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
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
