"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

const NAV_LINKS = [
  { href: "/", label: "Setup Guide" },
  { href: "/configure", label: "Configure Widget" },
  { href: "/voice-chat", label: "Standalone Demo" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const links = NAV_LINKS.filter((link) => link.href !== pathname)

  return (
    <header className="site-header relative">
      <Link href="/" className="site-logo">
        <span className="site-logo-mark" />
        <span>White Label VoiceWidget</span>
      </Link>
      <nav className="hidden items-center gap-2 sm:flex md:gap-3" aria-label="Main">
        {links.map((link) => (
          <Button key={link.href} asChild variant="brandOutline">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </nav>
      <div className="sm:hidden">
        <Button
          variant="brandOutline"
          size="icon"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
        {menuOpen && (
          <nav
            aria-label="Main"
            className="absolute top-full right-0 z-50 flex w-56 flex-col gap-2 border-2 border-black bg-white p-3 shadow-[0_2px_0_0_#000]"
          >
            {links.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="brandOutline"
                className="justify-start"
              >
                <Link href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
