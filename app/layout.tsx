"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Headline from "./components/Headline";
import React, { useEffect, useState } from "react";
import { HideWeekendsProvider } from "./context/HideWeekendsContext";

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
  const [hideWeekends, setHideWeekends] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("hideWeekends") === "true";
    return false;
  });

  useEffect(() => {
    localStorage.setItem("hideWeekends", String(hideWeekends));
  }, [hideWeekends]);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex flex-col min-h-dvh">
          <HideWeekendsProvider>
            <Headline />
            <main className="flex-1 justify-center items-center flex w-full">{children}</main>
          </HideWeekendsProvider>
        </div>
      </body>
    </html>
  );
}
