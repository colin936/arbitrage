import React from "react";
import Navigation from "@components/Navigation";
import "@styles/globals.css";

export const metadata = {
  title: "Lease Management",
  description: "Corporate housing lease and deadline management"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-body">
        <Navigation />
        <main className="page-main">{children}</main>
      </body>
    </html>
  );
}
