import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Navigation from "./components/Navigation";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameLib.Ai",
  description: "Welcome to GameLib.Ai - Your Game Library Powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Suspense fallback={<div className="h-16" />}>
            <Navigation />
          </Suspense>
          <div className="page-fade-in">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
