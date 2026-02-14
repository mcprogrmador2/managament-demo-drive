import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SystemInitializer } from "@/lib/hooks";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión de Proyectos - Plataforma Empresarial",
  description: "Sistema de gestión de proyectos empresariales con control de acceso y documentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SystemInitializer>
            {children}
          </SystemInitializer>
          <Toaster position="top-right" />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
