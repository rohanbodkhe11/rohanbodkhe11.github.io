"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Eye } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProjectsGrid() {
  const [filter, setFilter] = useState("all");
  const db = useFirestore();

  const projectsQuery = useMemoFirebase(() => query(collection(db, "projects"), orderBy("createdAt", "desc")), [db]);
  const { data: projects, isLoading } = useCollection(projectsQuery);

  const categories = ["all", "webdev", "cybersecurity", "tools"];
  
  const filteredProjects = !projects ? [] : filter === "all" 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <section id="projects" className="py-24 bg-card/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="text-left">
            <span className="font-code text-primary text-sm tracking-[0.4em] mb-4 block uppercase">
              [ MY_REPOSITORIES ]
            </span>
            <h2 className="text-3xl md:text-5xl font-headline font-bold">
              LATEST <span className="text-primary">PROJECTS</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full font-code text-xs tracking-widest uppercase transition-all duration-300 border ${
                  filter === cat
                    ? "bg-primary text-background border-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                    : "bg-transparent text-muted-foreground border-primary/20 hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-[400px] animate-pulse bg-primary/5" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-primary/10 rounded-3xl">
            <p className="font-code text-muted-foreground uppercase tracking-widest">No active repository nodes found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group glass-card overflow-hidden hover:-translate-y-2 transition-all duration-500 border-primary/10 hover:border-primary/40"
              >
                <div className="relative w-full h-40 md:h-48 lg:h-56 overflow-hidden">
                  <Image
                    src={project.imageUrl || "https://picsum.photos/seed/project/800/450"}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex gap-4">
                      {/* Note: In a real app, you might have a slug-based detail page, but for now we'll prioritize external links */}
                      {project.githubUrl && (
                        <Button asChild size="icon" variant="secondary" className="rounded-full">
                           <Link href={project.githubUrl} target="_blank"><Github className="h-5 w-5" /></Link>
                        </Button>
                      )}
                      {project.liveUrl && (
                        <Button asChild size="icon" variant="secondary" className="rounded-full">
                           <Link href={project.liveUrl} target="_blank"><ExternalLink className="h-5 w-5" /></Link>
                        </Button>
                      )}
                    </div>
                  </div>
                  {project.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary text-background font-headline text-[10px] tracking-widest">FEATURED</Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-code text-[10px] text-primary uppercase tracking-widest">
                      {project.category}
                    </span>
                    <span className={`text-[10px] font-code px-2 py-0.5 rounded border ${
                      project.status === 'completed' ? 'border-accent/40 text-accent' : 'border-secondary/40 text-secondary'
                    }`}>
                      {project.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {project.shortDescription}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.techStack?.map((tech: string) => (
                      <span key={tech} className="tech-pill">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                     {project.githubUrl && (
                       <Link href={project.githubUrl} target="_blank" className="text-xs font-code flex items-center hover:text-primary transition-colors">
                         <Github className="mr-1 h-3 w-3" /> GITHUB
                       </Link>
                     )}
                     {project.liveUrl && (
                       <Link href={project.liveUrl} target="_blank" className="text-xs font-code flex items-center hover:text-primary transition-colors">
                         <ExternalLink className="mr-1 h-3 w-3" /> DEMO
                       </Link>
                     )}
                     {!project.githubUrl && !project.liveUrl && (
                       <span className="text-[8px] font-code text-muted-foreground uppercase tracking-widest italic">In_Development</span>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}