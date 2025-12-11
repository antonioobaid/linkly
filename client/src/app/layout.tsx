/*import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import NavbarWrapper from "./components/NavbarWrapper"; // klient-wrapper

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linkly",
  description: "Social Network App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
      
        <NavbarWrapper />

        <main className="min-h-screen ">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}*/





import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import NavbarWrapper from "./components/NavbarWrapper";
import Script from "next/script";
import ChatNotifications from "./components/ChatNotifications";
import OneSignalClient from "./components/OneSignalClient"; // ✅ Importera OneSignalClient

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linkly",
  description: "Social Network App",
};

declare global {
  interface Window {
    OneSignal?: any;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
          defer
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignal = window.OneSignal || [];
            OneSignal.push(function() {
              OneSignal.init({
                appId: "2dcf0f6a-552a-4a3c-af6e-eea3a5319bf3",
                allowLocalhostAsSecureOrigin: true,
                notifyButton: { enable: true },
                welcomeNotification: {
                  title: "Linkly",
                  message: "Tack för att du prenumererar!"
                }
              }); 
            });
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NavbarWrapper />
        <OneSignalClient /> {/* ✅ Lägg till OneSignalClient */}
        <ChatNotifications /> {/* Aviseringar när sidan är öppen */}
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
