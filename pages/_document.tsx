import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              // Immediately execute to avoid flash of unstyled content
              (function() {
                // Hide content until client hydration
                document.documentElement.style.visibility = 'hidden';
                
                window.addEventListener('DOMContentLoaded', function() {
                  // Wait until hydration completes
                  setTimeout(function() {
                    document.documentElement.style.visibility = '';
                  }, 10);
                });
              })();
            `
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
