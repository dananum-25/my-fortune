export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google Search Console */}
        <meta
          name="google-site-verification"
          content="5FKwm4_bVWL9skvm5olmNjvPSIzR_tW75VT_0NpJ9VA"
        />

        {/* Google AdSense 계정 */}
        <meta
          name="google-adsense-account"
          content="ca-pub-7356591276029815"
        />

        {/* Naver Search Advisor */}
        <meta
          name="naver-site-verification"
          content="20b0cc209520048d7c651297a28b316fe1de7cd8"
        />

        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7356591276029815"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
