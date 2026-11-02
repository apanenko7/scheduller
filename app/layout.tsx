"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Headline from "./components/Headline";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-dvh">
          <Headline />
          <main className="flex-1 justify-center items-center flex w-full">{children}</main>
        </div>
      </body>
    </html>
  );
}
