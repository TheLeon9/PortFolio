import Head from 'next/head';

import '@/styles/globals.scss';
import '@/styles/variables.scss';

import Layout from '@/components/layout';

import Logo from 'p/img/logo/logo_fm.svg';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Moracchini Florian</title>
        <link rel="shortcut icon" href={Logo.src} />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
