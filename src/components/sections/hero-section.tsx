"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleField } from "@/components/three/particle-field";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const DEFAULT_ROLES = [
  "B.Tech Engineering Student",
  "Web Developer",
  "Cybersecurity Enthusiast"
];

export function HeroSection() {
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(db, "siteSettings", "settings"), [db]);
  const { data: siteSettings } = useDoc(settingsRef);

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Profile image from placeholder mapping
  const profileImage = PlaceHolderImages.find(img => img.id === 'profile')?.imageUrl || "https://i.ibb.co/24nN9ty/about-me123.png";

  // Use dynamic roles or provided tagline
  const roles = siteSettings?.tagline ? [siteSettings.tagline] : DEFAULT_ROLES;

  useEffect(() => {
    const currentRole = roles[roleIndex % roles.length];
    const typingSpeed = isDeleting ? 50 : 100;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentRole.substring(0, displayText.length + 1));
        if (displayText === currentRole) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentRole.substring(0, displayText.length - 1));
        if (displayText === "") {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden bg-background">
      <ParticleField />
      
      <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center">
        {/* Profile Image with Animated Neon Rings */}
        <div className="relative mb-12 animate-float">
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
          <div className="absolute -inset-4 rounded-full border border-secondary/30 animate-pulse" />
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-background shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
            <Image
              src={profileImage}
              alt="Rohan Bodkhe"
              fill
              className="object-cover"
              priority
              unoptimized={profileImage.includes('ibb.co')}
              data-ai-hint="Rohan Bodkhe portrait"
            />
          </div>
          {/* Tech Orbit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-primary/40 flex items-center justify-center animate-spin-slow">
                <span className="text-[10px] font-code text-primary">RB</span>
             </div>
          </div>
        </div>

        <div className="mb-4">
          <span className="font-code text-accent text-sm tracking-[0.4em] uppercase">
            &lt; Hello, I'am /&gt;
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl lg:text-[6rem] font-headline mb-6 tracking-tight leading-tight">
          <span className="gradient-text neon-glow font-extrabold">ROHAN BODKHE</span>
        </h1>

        <div className="h-8 md:h-12 mb-8">
          <span className="font-code text-xl md:text-3xl text-foreground">
            {displayText}
            <span className="animate-pulse text-primary ml-1">|</span>
          </span>
        </div>

        <p className="max-w-2xl font-body text-muted-foreground text-lg md:text-xl mb-12 italic leading-relaxed">
          "From Code to Security — Crafting Future-Ready Digital Solutions."
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-16">
          <Button asChild size="lg" className="font-headline tracking-widest text-xs px-8 h-12 bg-primary text-background hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <Link href="#projects">
              VIEW PROJECTS <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-headline tracking-widest text-xs px-8 h-12 border-primary/30 hover:border-primary">
            <Link href="#contact">GET IN TOUCH</Link>
          </Button>
        </div>

        {/* Social Link Indicators from Settings */}
        <div className="flex gap-4 mb-16">
          <Link href={siteSettings?.socialGithubUrl || "https://github.com/rohanbodkhe11"} target="_blank" className="p-3 glass-card border-primary/20 hover:border-primary text-primary transition-all">
            <Github className="w-5 h-5" />
          </Link>
          <Link href={siteSettings?.socialLinkedinUrl || "https://www.linkedin.com/in/rohan-bodkhe-4476bb326"} target="_blank" className="p-3 glass-card border-primary/20 hover:border-primary text-primary transition-all">
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-4xl w-full border-t border-primary/10 pt-12">
          {[
            { label: "Active Nodes", value: "10+" },
            { label: "Credentials", value: "5+" },
            { label: "Uptime (Years)", value: "2+" },
            { label: "Curiosity", value: "∞" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-2xl md:text-4xl font-code text-primary mb-2">
                {stat.value}
              </span>
              <span className="text-xs font-headline tracking-[0.2em] text-muted-foreground uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-1 h-12 bg-gradient-to-b from-primary to-transparent rounded-full" />
      </div>
    </section>
  );
}
