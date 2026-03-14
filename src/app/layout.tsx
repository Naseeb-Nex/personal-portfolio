import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const anthonyGilford = localFont({
  src: "../assets/fonts/Anthony Gilford.otf",
  variable: "--font-anthony",
});

export const metadata: Metadata = {
  title: "Muhammed Naseeb // AI Engineer",
  description: "Portfolio of Muhammed Naseeb, AI Engineer & Developer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${anthonyGilford.variable} antialiased selection:bg-[#00f0ff] selection:text-black`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
