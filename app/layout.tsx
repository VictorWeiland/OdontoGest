import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionAuthProvider } from '@/components/session-auth'
import { QueryClientContext } from "@/providers/queryClient";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { SITE_URL } from "@/lib/landing-config";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const title = "OdontoGEST - Agende consultas odontológicas em poucos cliques";
const description =
  "Plataforma de agendamento online e gestão para clínicas odontológicas. Pacientes agendam em poucos cliques; clínicas organizam agenda, pacientes e lembretes.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  icons: { icon: "/favicon.ico" },
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "OdontoGEST",
    title,
    description,
    images: [{ url: "/dentist-hero.jpg", alt: "Dentista sorrindo em consultório odontológico" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/dentist-hero.jpg"],
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('odontogest-theme');var r=(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))?'dark':'light';var d=document.documentElement;d.classList.toggle('dark',r==='dark');d.style.colorScheme=r;}catch(e){}})();`;

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${jakarta.variable} font-sans h-full antialiased`}
      >
        <ThemeProvider>
          <SessionAuthProvider>
            <QueryClientContext>
              <ThemedToaster />
              {children}
            </QueryClientContext>
          </SessionAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
