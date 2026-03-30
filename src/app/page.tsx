"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Shield, Globe, Layout, ChevronRight, Mail, Loader2, BookOpen, GraduationCap, Award, ExternalLink, Code, Cpu, Smartphone, Target, Zap } from "lucide-react";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { SKILLS, EDUCATION } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // Profile image from placeholder mapping
  const profileImage = PlaceHolderImages.find(img => img.id === 'profile')?.imageUrl || "https://picsum.photos/seed/rohan_pro/600/800";

  // Real-time data fetching
  const settingsRef = useMemoFirebase(() => doc(db, "siteSettings", "settings"), [db]);
  const { data: siteSettings } = useDoc(settingsRef);

  const educationQuery = useMemoFirebase(() => query(collection(db, "education"), orderBy("order", "asc")), [db]);
  const { data: firestoreEducation } = useCollection(educationQuery);

  // Fallback to mock data if Firestore is empty
  const educationData = firestoreEducation && firestoreEducation.length > 0 ? firestoreEducation : EDUCATION;

  // map for icon lookup used by the skills renderer
  const ICON_MAP: Record<string, any> = {
    Code,
    Zap,
    Layout,
    Globe,
    Shield,
    Cpu,
    ExternalLink,
    BookOpen,
    GraduationCap,
    Target,
    Smartphone,
    Award
  };

  const certsQuery = useMemoFirebase(() => query(collection(db, "certifications"), orderBy("dateIssued", "desc")), [db]);
  const { data: certifications } = useCollection(certsQuery);

  const galleryQuery = useMemoFirebase(() => query(collection(db, "galleryItems"), orderBy("uploadedAt", "desc")), [db]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const messagesRef = collection(db, "contactMessages");
    addDocumentNonBlocking(messagesRef, {
      ...formData,
      isRead: false,
      receivedAt: serverTimestamp(),
    });

    toast({
      title: "MESSAGE_SENT",
      description: "Your transmission has been received and encrypted.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      
      <HeroSection />

      {/* About Section */}
      <section id="about" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary to-secondary opacity-20 blur-2xl rounded-3xl" />
              <div className="relative glass-card p-2 rounded-3xl overflow-hidden aspect-square max-w-md mx-auto lg:mx-0">
                <Dialog>
                  <DialogTrigger className="w-full h-full text-left outline-none cursor-pointer">
                    <img 
                      src={profileImage} 
                      alt="Rohan Bodkhe" 
                      className="rounded-2xl object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
                      data-ai-hint="Rohan Bodkhe portrait"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-xl bg-background/95 backdrop-blur-xl border border-primary shadow-[0_0_50px_hsl(var(--primary)/0.5)] p-2">
                    <DialogTitle className="sr-only">About Profile Image</DialogTitle>
                    <DialogDescription className="sr-only">A larger view of the profile image.</DialogDescription>
                    <img src={profileImage} alt="Rohan Bodkhe" className="w-full h-auto rounded-xl object-contain" />
                  </DialogContent>
                </Dialog>
                {siteSettings?.availableForWork !== false && (
                  <div className="absolute bottom-6 left-6 right-6 p-4 glass-card border-accent/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="font-code text-xs text-accent uppercase tracking-widest">Available for Internship</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-2 lg:order-1">
              <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase"> WHO AM I</span>
              <h2 className="text-3xl md:text-5xl font-headline font-bold mb-8">ROHAN <span className="text-primary">BODKHE</span></h2>
              
              <div className="space-y-6 text-muted-foreground text-lg leading-relaxed mb-12">
                {siteSettings?.bio ? (
                  <p className="whitespace-pre-wrap">{siteSettings.bio}</p>
                ) : (
                  <p>
                    I am Rohan Santosh Bodke, a passionate and dedicated B.Tech engineering student at MIT College (Autonomous), Chhatrapati Sambhaji Nagar, currently in my second year. I have a strong interest in Web Development, Cybersecurity, and Software Engineering.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                 <div className="glass-card p-6 border-primary/10">
                    <h4 className="font-headline text-xs text-primary mb-3 uppercase flex items-center gap-2"><Target className="w-4 h-4" /> Career Goals</h4>
                    <p className="text-[11px] text-muted-foreground uppercase leading-relaxed">Building strong development skills, mastering cybersecurity, and creating impactful real-world projects for top tech companies.</p>
                 </div>
                 <div className="glass-card p-6 border-primary/10">
                    <h4 className="font-headline text-xs text-accent mb-3 uppercase flex items-center gap-2"><Zap className="w-4 h-4" /> Personal Traits</h4>
                    <p className="text-[11px] text-muted-foreground uppercase leading-relaxed">Quick learner, self-motivated, problem-solving mindset, and dedicated to continuous technology innovation.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <Code />, title: "Web Dev", desc: "React & Next.js" },
                  { icon: <Shield />, title: "Security", desc: "Ethical Hacking" },
                  { icon: <Cpu />, title: "Systems", desc: "Digital Solutions" },
                ].map((item, i) => (
                  <div key={i} className="glass-card p-6 border-primary/10 hover:border-primary transition-all">
                    <div className="text-primary mb-4">{item.icon}</div>
                    <h4 className="font-headline text-xs tracking-widest mb-2">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Matrix */}
      <section className="py-24 border-y border-primary/10 bg-card/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase"> TECH_STACK </span>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">TECHNICAL <span className="text-primary">SKILLS</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SKILLS.map((skillGroup, idx) => (
              <div key={idx} className="glass-card p-8 border-primary/10">
                <h3 className="font-headline text-xs text-primary mb-6 tracking-widest uppercase">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill: any, sIdx: number) => {
                    const title = typeof skill === "string" ? skill : skill.title;
                    const iconKey = typeof skill === "string" ? null : skill.icon;
                    const Icon = iconKey ? (ICON_MAP[iconKey] || Code) : null;
                    return (
                      <span key={sIdx} className="tech-pill inline-flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4 text-primary" />}
                        <span>{title}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Timeline */}
      <section id="education" className="py-24 bg-card/20 border-y border-primary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase">[ ACADEMIC_TRACK ]</span>
            <h2 className="text-3xl md:text-5xl font-headline font-bold mb-8">ACADEMIC <span className="text-primary">JOURNEY</span></h2>
            <p className="text-muted-foreground text-lg leading-relaxed italic">
              "My academic journey reflects my consistent dedication to learning and building a strong technical foundation in engineering and technology. From secondary education to pursuing my B.Tech, I focus on transforming theoretical knowledge into practical expertise."
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {educationData.map((edu, i) => (
              <div key={edu.id} className="relative pl-8 md:pl-0">
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-primary/20" />
                <div className="md:flex items-center justify-between gap-12 group">
                  <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:text-right' : 'md:order-last'}`}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="glass-card p-8 border-primary/10 hover:border-primary/40 transition-all cursor-pointer">
                          <div className={`flex flex-col ${i % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                            <span className="font-code text-primary text-xs tracking-widest block mb-2">{edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}</span>
                            <h3 className="text-xl font-headline mb-2">{edu.institutionName}</h3>
                            <p className="text-accent text-sm font-code mb-4 uppercase">{edu.degreeCourseName}</p>
                            <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">{edu.description}</p>
                            <Badge variant="outline" className="font-code border-primary/30 text-primary w-fit">{edu.cgpaPercentage}</Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-primary shadow-[0_0_50px_hsl(var(--primary)/0.5)] p-8">
                        <DialogTitle className="text-2xl font-headline text-primary mb-2">{edu.institutionName}</DialogTitle>
                        <DialogDescription className="text-sm font-code text-accent uppercase mb-6">{edu.degreeCourseName} ({edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear})</DialogDescription>
                        <div className="space-y-4">
                          <p className="text-muted-foreground leading-relaxed">{edu.description}</p>
                          <div className="pt-4 border-t border-primary/20">
                            <span className="text-sm text-foreground mr-4">Performance:</span>
                            <Badge variant="outline" className="font-code border-primary/30 text-primary">{edu.cgpaPercentage}</Badge>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="absolute left-0 md:left-1/2 top-10 md:-translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary z-10 shadow-[0_0_10px_hsl(var(--primary))] group-hover:scale-150 transition-transform" />
                  
                  <div className="hidden md:block md:w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProjectsGrid />

      {/* Certifications Section */}
      <section id="certifications" className="py-24 bg-card/10">
        <div className="container mx-auto px-4">
           <div className="text-center mb-16">
              <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase">[ ACHIEVEMENTS ]</span>
              <h2 className="text-3xl md:text-5xl font-headline font-bold">PROFESSIONAL <span className="text-primary">CERTS</span></h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {certifications?.map((cert) => (
                <div key={cert.id} className="glass-card p-6 border-primary/10 hover:border-primary/40 transition-all group">
                   <div className="aspect-video relative mb-6 bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center p-4">
                      <img src={cert.imageUrl} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={cert.title} />
                   </div>
                   <Badge variant="outline" className="mb-2 text-[8px] font-code uppercase border-primary/20 text-primary">{cert.category}</Badge>
                   <h3 className="font-headline text-xs tracking-widest mb-1">{cert.title}</h3>
                   <p className="text-[10px] font-code text-muted-foreground uppercase mb-4">{cert.issuer}</p>
                   {cert.credentialUrl && (
                     <Button asChild variant="ghost" className="w-full h-8 text-[8px] font-code uppercase tracking-widest border border-primary/10 hover:border-primary">
                        <Link href={cert.credentialUrl} target="_blank"><ExternalLink className="w-3 h-3 mr-2" /> Verify_Node</Link>
                     </Button>
                   )}
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24">
        <div className="container mx-auto px-4">
           <div className="text-left mb-16">
              <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase"> VISUAL_DATA </span>
              <h2 className="text-3xl md:text-5xl font-headline font-bold">SYSTEM <span className="text-primary">GALLERY</span></h2>
           </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {galleryItems?.map((item, i) => (
               <Dialog key={item.id}>
                 <DialogTrigger asChild>
                   <div className={`cursor-pointer relative overflow-hidden rounded-xl border border-primary/10 group ${i % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                      <div className="w-full h-36 md:h-44 lg:h-48 overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                         <Badge className="w-fit mb-2 text-[8px] font-code uppercase pointer-events-none">{item.category}</Badge>
                         <h4 className="font-headline text-lg md:text-2xl text-primary pointer-events-none leading-tight">{item.title}</h4>
                      </div>
                   </div>
                 </DialogTrigger>
                 <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-xl border border-primary shadow-[0_0_50px_hsl(var(--primary)/0.5)] p-2">
                   <DialogTitle className="sr-only">{item.title}</DialogTitle>
                   <DialogDescription className="sr-only">A larger view of the gallery image.</DialogDescription>
                   <img src={item.imageUrl} alt={item.title} className="w-full max-h-[80vh] rounded-xl object-contain" />
                 </DialogContent>
               </Dialog>
             ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase">[ GET_IN_TOUCH ]</span>
              <h2 className="text-3xl md:text-5xl font-headline font-bold mb-8">LET'S <span className="text-primary">CONNECT</span></h2>
              <p className="text-muted-foreground text-lg mb-12 leading-relaxed">
                Whether you have a project in mind, want to discuss a potential internship, or just want to say hi, feel free to drop a message.
              </p>
              
              <div className="space-y-6">
                {[
                  { label: "Email", value: siteSettings?.contactEmail || "rohanbodkhe@gmail.com", icon: <Mail className="text-primary" /> },
                  { label: "Location", value: "Maharashtra, India", icon: <Globe className="text-primary" /> },
                  { label: "Identity", value: "Rohan Bodkhe", icon: <Shield className="text-primary" /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 glass-card border-primary/10">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-code text-muted-foreground tracking-widest uppercase mb-1">{item.label}</p>
                      <p className="font-headline text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-10 border-primary/20 shadow-2xl shadow-primary/5">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-code text-primary tracking-widest uppercase ml-1">Full Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-primary/20 rounded-lg p-4 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                      placeholder="Your Name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-code text-primary tracking-widest uppercase ml-1">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-primary/20 rounded-lg p-4 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                      placeholder="your@email.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-code text-primary tracking-widest uppercase ml-1">Subject</label>
                  <input 
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-background border border-primary/20 rounded-lg p-4 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Regarding Project Collaboration" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-code text-primary tracking-widest uppercase ml-1">Message</label>
                  <textarea 
                    required
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-background border border-primary/20 rounded-lg p-4 font-body focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none" 
                    placeholder="Your message here..." 
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-background font-headline tracking-widest text-xs hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "SEND_MESSAGE_ENCRYPTED"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
