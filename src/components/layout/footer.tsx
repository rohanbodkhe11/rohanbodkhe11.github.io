
"use client";

import Link from "next/link";
import { Github, Linkedin, Twitter, Instagram, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-primary/20 pt-16 pb-8 overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="font-headline font-bold text-background text-lg">RB</span>
              </div>
              <span className="font-headline tracking-[0.3em] text-xl">
                ROHAN <span className="text-primary">BODKHE</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
              Engineering student and developer focused on building high-performance, secure web applications. Securing the digital frontier, one line of code at a time.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Github />, href: "#" },
                { icon: <Linkedin />, href: "#" },
                { icon: <Twitter />, href: "#" },
                { icon: <Instagram />, href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-primary/20 flex items-center justify-center hover:border-primary hover:text-primary transition-all duration-300"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-headline text-sm tracking-widest mb-6 uppercase text-primary">System Map</h4>
            <ul className="space-y-4">
              {["Home", "About", "Projects", "Certifications", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link href={`/#${item.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors font-code text-sm">
                    {`// ${item.toUpperCase()}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-headline text-sm tracking-widest mb-6 uppercase text-primary">Contact Info</h4>
            <ul className="space-y-4 font-code text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 text-primary" />
                <span className="text-muted-foreground">rohan@example.com</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 mt-1 text-primary" />
                <span className="text-muted-foreground">Maharashtra, India</span>
              </li>
              <li className="pt-4">
                <div className="flex items-center gap-2 text-accent">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest">Available for internships</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-code text-muted-foreground uppercase tracking-widest">
          <p>All Rights Reserved by Rohan BOdke</p>
          <p>Designed & Developed with <span className="text-destructive">♥</span> using Next.js 15</p>
        </div>
      </div>
    </footer>
  );
}
