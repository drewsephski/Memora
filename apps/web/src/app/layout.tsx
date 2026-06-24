import "@/styles/tailwind.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { APP_NAME } from "./consts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import { getAuthUser } from "@/utils/supabase/get-user";
import { CSPostHogProvider } from "./providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: `%s - ${APP_NAME}`,
    default: `${APP_NAME} - The memory layer for your LLM`,
  },
  metadataBase: new URL("https://memoralabs.dev"),
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthUser();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <CSPostHogProvider>
        <body className="min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-sans">
          <AuthProvider initialUser={user}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </CSPostHogProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!} />
    </html>
  );
}
