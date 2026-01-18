export const metadata = {
  title: "오늘의 운세 · AI 고양이 상담사 | 띠·MBTI·연애·금전·타로",
  description:
    "생년월일 기반 오늘의 운세와 AI 고양이 상담사가 함께하는 맞춤 운세 상담. 띠, MBTI, 연애운, 금전운, 직업운, 타로까지 한 번에 확인하세요.",
  verification: {
    google: "5FKwm4_bVWL9skvm5olmNjvPSIzR_tW75VT_0NpJ9VA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense */}
        <meta
          name="google-adsense-account"
          content="ca-pub-7356591276029815"
        />
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
