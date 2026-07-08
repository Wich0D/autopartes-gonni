import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s | Autopartes GONNI",
    default: "Autopartes GONNI - Venta de Refacciones Multimarcas",
  },
  description: "En Autopartes GONNI ofrecemos una amplia variedad de refacciones y autopartes de alta calidad para vehículos de todas las marcas. Encuentra amortiguadores, balatas, filtros y más al mejor precio.",
  keywords: [
    "autopartes", "refacciones", "autos", "carros", "marcas", "NISSAN", "CHEVROLET", 
    "TOYOTA", "amortiguadores", "balatas", "filtros", "gonni", "autopartes gonni", 
    "venta de refacciones", "refacciones mexico", "cotizar autopartes"
  ],
  authors: [{ name: "Autopartes GONNI" }],
  creator: "Autopartes GONNI",
  publisher: "Autopartes GONNI",
  metadataBase: new URL("https://autopartesgonni.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Autopartes GONNI - Venta de Refacciones Multimarcas",
    description: "Venta y cotización de refacciones automotrices multimarcas. Encuentra y cotiza amortiguadores, balatas, filtros y más con la mejor calidad.",
    url: "https://autopartesgonni.com",
    siteName: "Autopartes GONNI",
    images: [
      {
        url: "/og_image.png",
        width: 1200,
        height: 630,
        alt: "Autopartes GONNI - Refacciones Automotrices Multimarcas",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autopartes GONNI - Venta de Refacciones Multimarcas",
    description: "Venta y cotización de refacciones automotrices multimarcas de alta calidad.",
    images: ["/og_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-24">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
