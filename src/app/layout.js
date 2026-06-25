import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { SiteNavbar } from "@/components/site-navbar.jsx";
import { SiteFooter } from "@/components/site-footer.jsx";
import ToastHost from "@/components/toast-host.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Code2Startup",
  description: "Startup team builder platform for founders, collaborators, and admins.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100">
        <SiteNavbar />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <ToastHost />
      </body>
    </html>
  );
}
