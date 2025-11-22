import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LEARNIFY",
  description: "AI based Learning Management System",
  // icons: {
  //   icon: "/favicon.ico",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            {children}
            <Toaster position="top-center" richColors />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
