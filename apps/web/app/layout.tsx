// app/layout.tsx
import React from "react";

export const metadata = {
  title: "Flowbit Analytics Dashboard",
  description: "Interactive analytics dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 20, background: '#f9f9f9' }}>
        {children}
      </body>
    </html>
  );
}
