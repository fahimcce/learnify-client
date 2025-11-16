import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Learnify - AI-Powered E-Learning Platform",
  description:
    "Transform your learning journey with personalized AI tutoring, adaptive assessments, and intelligent study plans. Learn smarter, not harder with Learnify.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ReduxProvider>
          {children}
          <Toaster position="top-center" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
