//=============================================================================
// _document — Custom Next.js HTML skeleton (head + body)
//
// Next.js uses this file to render the outer HTML shell on the server. We
// keep it minimal: only the Google Fonts preconnect + stylesheet links go
// here, because Next.js requires fonts to be declared in _document for the
// SSR pass to ship them in the initial HTML.
//=============================================================================

//-- Imports ------------------------------------------------------------------
// Next.js building blocks for the document shell.
import { Html, Head, Main, NextScript } from 'next/document';

/**
 * Document
 * Custom HTML shell. Returns the full <html><head><body> structure that
 * Next.js renders around every page.
 */
function Document() {
  //-- Render -----------------------------------------------------------------
  return (
    <Html lang="fr">
      <Head>
        {/* Preconnect tells the browser to open the TCP/TLS handshake to the
            font hosts before it actually needs them — saves ~100ms on the
            first load. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Actual font stylesheet — Nunito for body text, Orbitron for titles. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400&family=Orbitron:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/* `Main` is where the page content gets injected, `NextScript` ships
            the runtime + chunks. Their order matters for hydration. */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
