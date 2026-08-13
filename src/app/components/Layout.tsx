import React from "react";
import Navigation from "@components/Navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f7f8fb" }}>
      <Navigation />
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
}
