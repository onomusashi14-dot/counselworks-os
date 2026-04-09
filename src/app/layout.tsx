"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>CounselWorks OS</title>
        <meta name="description" content="Legal operations platform for law firms" />
      </head>
      <body className="bg-navy-900 text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
