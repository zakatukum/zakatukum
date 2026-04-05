import { Inter, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const notoNaskhArabic = Noto_Naskh_Arabic({ subsets: ['arabic'] });

export const metadata = {
  title: 'Zakatukum — زكاتكم | Your Zakat Calculator',
  description:
    'A comprehensive zakat calculator supporting multiple currencies and languages. Calculate precise zakat on wealth, investments, livestock, agriculture, and more. Free, secure, and built for the Muslim community.',
  keywords:
    'zakat calculator, Islamic calculator, wealth calculator, Arabic calculator, zakat app, Islamic finance',
  authors: [{ name: 'Zakatukum Team' }],
  creator: 'Zakatukum',
  publisher: 'Zakatukum',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zakatukum.com',
    siteName: 'Zakatukum',
    title: 'Zakatukum — زكاتكم | Your Zakat Calculator',
    description:
      'Calculate your zakat with precision. Support for multiple currencies, languages, and zakat categories.',
    images: [
      {
        url: 'https://zakatukum.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Zakatukum - Zakat Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zakatukum — زكاتكم | Your Zakat Calculator',
    description: 'Calculate your zakat with precision and ease.',
    images: ['https://zakatukum.com/twitter-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
