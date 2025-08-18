import Head from 'next/head';
import { useRouter } from 'next/router';

import '@/styles/variables.scss';

import Layout from '@/components/layout/public';
import AdminLayout from '@/components/layout/admin';
import { ThemeProvider } from '@/context/ThemeContext.js';
import { ConstantsProvider } from '@/context/ConstantsContext';

import Logo from 'p/img/logo/logo_fm_white.svg';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Detect if the current page is part of the admin panel
  const isAdminPage = router.pathname.startsWith('/admin');

  // Load global styles dynamically based on the layout type
  if (typeof window !== 'undefined') {
    if (isAdminPage) {
      require('@/styles/admin/globals.scss');
    } else {
      require('@/styles/public/globals.scss');
    }
  }

  // Dynamically select layout based on page type
  const getLayout =
    Component.getLayout ||
    ((page) =>
      isAdminPage ? (
        <AdminLayout>{page}</AdminLayout>
      ) : (
        <Layout>{page}</Layout>
      ));

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
        <ConstantsProvider>
          {getLayout(<Component {...pageProps} />)}
        </ConstantsProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
