
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/#projects" },
  { name: "Education", href: "/#education" },
  { name: "Blog", href: "/#blog" },
  { name: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-primary/20"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:rotate-12 transition-transform">
            <span className="font-headline font-bold text-background text-lg">RB</span>
          </div>
          <span className="font-headline tracking-[0.3em] text-xl hidden sm:block">
            ROHAN <span className="text-primary">BODKHE</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-code text-sm uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Button asChild variant="outline" className="font-headline tracking-widest text-xs border-primary/30 hover:border-primary">
            <Link href="/admin/login">
              <Terminal className="mr-2 h-4 w-4" />
              SYSTEM_LOGIN
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-primary/20 p-8 md:hidden animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-6 items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-headline tracking-widest text-lg"
              >
                {link.name}
              </Link>
            ))}
            <Button asChild variant="outline" className="w-full font-headline tracking-widest">
              <Link href="/admin/login" onClick={() => setIsMobileMenuOpen(false)}>
                SYSTEM_LOGIN
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
