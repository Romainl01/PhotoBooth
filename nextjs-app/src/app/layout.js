import { Geist, Geist_Mono, DM_Mono, IBM_Plex_Mono, Crimson_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

const crimsonPro = Crimson_Pro({
  weight: ['700'],
  subsets: ["latin"],
  variable: "--font-crimson-pro",
});

export const metadata = {
  title: "Morpheo - AI Photobooth",
  description: "Transform your photos with AI-powered creative filters",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/logo.svg',
    shortcut: '/logo.svg',
  },
  openGraph: {
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    url: 'https://morpheo-phi.vercel.app',
    siteName: 'Morpheo',
    images: [
      {
        url: 'https://morpheo-phi.vercel.app/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Morpheo Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Morpheo - AI Photobooth",
    description: "Transform your photos with AI-powered creative filters",
    images: ['https://morpheo-phi.vercel.app/logo.svg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmMono.variable} ${ibmPlexMono.variable} ${crimsonPro.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
