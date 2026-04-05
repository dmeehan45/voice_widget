import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "White Label VoiceWidget",
  description: "White-label ElevenLabs voice widget setup and embedding tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-primary">
        {children}
      </body>
    </html>
  )
}
