import type { Metadata } from "next";
import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Quizett - Interactive Learning Quizzes",
  description: "Take fun quizzes on various topics with hints and progress tracking.",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <Navbar />
          {children}
        <Footer />
      </body>
    </html>
  );
}
