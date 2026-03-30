"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  MessageSquare, 
  Package, 
  Plus, 
  Sparkles, 
  LogOut,
  Settings,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Cpu,
  Lock,
  Loader2,
  Wand2,
  Award,
  Image as ImageIcon,
  ExternalLink,
  Edit2,
  Save,
  Globe,
  Github,
  Linkedin,
  Mail,
  Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, limit, doc, serverTimestamp } from "firebase/firestore";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { generateProjectDescription } from "@/ai/flows/project-description-generator";

export default function Dashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog States
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [isGalleryDialogOpen, setIsGalleryDialogOpen] = useState(false);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingCert, setEditingCert] = useState<any>(null);

  // Form Field States
  const [projectForm, setProjectForm] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    category: "webdev",
    techStack: "",
    imageUrl: "",
    githubUrl: "",
    liveUrl: "",
    status: "completed",
    featured: false
  });

  const [settingsForm, setSettingsForm] = useState({
    bio: "",
    tagline: "",
    contactEmail: "",
    socialGithubUrl: "",
    socialLinkedinUrl: "",
    availableForWork: true
  });

  // Protect the route
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, isUserLoading, router]);

  // Sync state when editing
  useEffect(() => {
    if (editingProject) {
      setProjectForm({
        title: editingProject.title || "",
        shortDescription: editingProject.shortDescription || "",
        longDescription: editingProject.longDescription || "",
        category: editingProject.category || "webdev",
        techStack: editingProject.techStack?.join(", ") || "",
        imageUrl: editingProject.imageUrl || "",
        githubUrl: editingProject.githubUrl || "",
        liveUrl: editingProject.liveUrl || "",
        status: editingProject.status || "completed",
        featured: editingProject.featured || false
      });
    } else {
      setProjectForm({
        title: "",
        shortDescription: "",
        longDescription: "",
        category: "webdev",
        techStack: "",
        imageUrl: "",
        githubUrl: "",
        liveUrl: "",
        status: "completed",
        featured: false
      });
    }
  }, [editingProject]);

  // Check admin status
  const adminRef = useMemoFirebase(() => user ? doc(db, "admins", user.uid) : null, [db, user]);
  const { data: adminDoc, isLoading: adminLoading } = useDoc(adminRef);

  // Site Settings Sync
  const settingsRef = useMemoFirebase(() => doc(db, "siteSettings", "settings"), [db]);
  const { data: settingsDoc } = useDoc(settingsRef);

  useEffect(() => {
    if (settingsDoc) {
      setSettingsForm({
        bio: settingsDoc.bio || "",
        tagline: settingsDoc.tagline || "",
        contactEmail: settingsDoc.contactEmail || "",
        socialGithubUrl: settingsDoc.socialGithubUrl || "",
        socialLinkedinUrl: settingsDoc.socialLinkedinUrl || "",
        availableForWork: settingsDoc.availableForWork ?? true
      });
    }
  }, [settingsDoc]);

  // Real-time queries
  const messagesQuery = useMemoFirebase(() => adminDoc ? query(collection(db, "contactMessages"), orderBy("receivedAt", "desc"), limit(50)) : null, [db, adminDoc]);
  const { data: messages } = useCollection(messagesQuery);

  const projectsQuery = useMemoFirebase(() => adminDoc ? query(collection(db, "projects"), orderBy("createdAt", "desc")) : null, [db, adminDoc]);
  const { data: projects } = useCollection(projectsQuery);

  const certsQuery = useMemoFirebase(() => adminDoc ? query(collection(db, "certifications"), orderBy("dateIssued", "desc")) : null, [db, adminDoc]);
  const { data: certifications } = useCollection(certsQuery);

  const galleryQuery = useMemoFirebase(() => adminDoc ? query(collection(db, "galleryItems"), orderBy("uploadedAt", "desc")) : null, [db, adminDoc]);
  const { data: galleryItems } = useCollection(galleryQuery);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/admin/login");
    } catch (err) {
      toast({ title: "LOGOUT_ERROR", variant: "destructive" });
    }
  };

  const handleInitializeAdmin = () => {
    if (!user || !adminRef) return;
    const adminData = {
      id: user.uid,
      username: user.displayName || user.email?.split('@')[0] || 'Admin',
      email: user.email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    setDocumentNonBlocking(adminRef, adminData, { merge: true });
    toast({ title: "SYSTEM_INITIALIZED", description: "Administrator node active." });
  };

  const handleAiGenerateDescription = async () => {
    if (!projectForm.title) {
      toast({ title: "VALIDATION_ERROR", description: "Project title required for AI generation.", variant: "destructive" });
      return;
    }
    setIsAiLoading(true);
    try {
      const result = await generateProjectDescription({
        projectName: projectForm.title,
        techStack: projectForm.techStack.split(",").map(s => s.trim()).filter(Boolean),
        projectGoals: "Showcase technical expertise in a professional portfolio.",
        keywords: ["modern", "scalable", "secure"]
      });
      
      setProjectForm(prev => ({
        ...prev,
        shortDescription: result.shortDescription,
        longDescription: result.longDescription
      }));
      toast({ title: "AI_GENERATION_SUCCESS" });
    } catch (error) {
       toast({ title: "AI_ERROR", description: "Could not generate content.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      ...projectForm,
      slug: projectForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      techStack: projectForm.techStack.split(",").map(s => s.trim()).filter(Boolean),
      imageUrl: projectForm.imageUrl || "https://picsum.photos/seed/project/800/450",
      updatedAt: serverTimestamp(),
    };

    if (editingProject) {
      updateDocumentNonBlocking(doc(db, "projects", editingProject.id), data);
      toast({ title: "PROJECT_UPDATED" });
    } else {
      addDocumentNonBlocking(collection(db, "projects"), { ...data, createdAt: serverTimestamp() });
      toast({ title: "PROJECT_CREATED" });
    }
    setIsProjectDialogOpen(false);
    setEditingProject(null);
  };

  const handleSaveCert = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      issuer: formData.get("issuer"),
      dateIssued: formData.get("dateIssued"),
      credentialUrl: formData.get("credentialUrl"),
      imageUrl: formData.get("imageUrl") || "https://picsum.photos/seed/cert/600/400",
      category: formData.get("category"),
    };

    if (editingCert) {
      updateDocumentNonBlocking(doc(db, "certifications", editingCert.id), data);
      toast({ title: "CERTIFICATION_UPDATED" });
    } else {
      addDocumentNonBlocking(collection(db, "certifications"), { ...data, createdAt: serverTimestamp() });
      toast({ title: "CERTIFICATION_ADDED" });
    }
    setIsCertDialogOpen(false);
    setEditingCert(null);
  };

  const handleSaveGalleryItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      imageUrl: formData.get("imageUrl"),
      imagePublicId: "gallery_" + Date.now(),
      category: formData.get("category"),
      uploadedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, "galleryItems"), data);
    toast({ title: "GALLERY_ITEM_ADDED" });
    setIsGalleryDialogOpen(false);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setDocumentNonBlocking(settingsRef, {
      ...settingsForm,
      id: "settings",
      maintenanceMode: false
    }, { merge: true });
    toast({ title: "SETTINGS_SYNCHRONIZED", description: "Core site parameters updated." });
  };

  if (isUserLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center font-code text-primary uppercase tracking-[0.3em] bg-background">Loading_System_V2...</div>;
  }

  if (user && !adminDoc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="glass-card max-w-md w-full border-primary/30 p-8 text-center space-y-8">
           <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse"><Lock className="w-10 h-10 text-primary" /></div>
              <h2 className="text-xl font-headline tracking-[0.2em] text-primary">PRIVILEGE_RESTRICTED</h2>
              <p className="font-code text-xs text-muted-foreground leading-relaxed">Identity <span className="text-foreground">{user.email}</span> is not registered in the admin net.</p>
           </div>
           <Button onClick={handleInitializeAdmin} className="w-full bg-primary text-background font-headline tracking-widest text-xs h-12"><Cpu className="w-4 h-4 mr-2" /> INITIALIZE_NODE</Button>
           <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground font-code text-[10px] uppercase">Switch_Identity</Button>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-primary/10 bg-card/50">
          <SidebarHeader className="p-6 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.3)]"><ShieldCheck className="w-5 h-5 text-background" /></div>
              <span className="font-headline tracking-widest text-xs uppercase">Command_Center</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              {[
                { id: "overview", label: "Overview", icon: LayoutDashboard },
                { id: "projects", label: "Projects", icon: Package },
                { id: "certs", label: "Certifications", icon: Award },
                { id: "gallery", label: "Gallery", icon: ImageIcon },
                { id: "messages", label: "Messages", icon: MessageSquare },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className={`font-code text-[10px] uppercase tracking-widest py-6 px-4 ${activeTab === item.id ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-muted-foreground hover:bg-primary/5"}`}
                  >
                    <item.icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <div className="mt-auto p-4 border-t border-primary/10">
            <Button variant="ghost" className="w-full justify-start font-code text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/10" onClick={handleLogout}><LogOut className="w-4 h-4 mr-3" />Kill_Session</Button>
          </div>
        </Sidebar>

        <main className="flex-1 p-8 overflow-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-headline tracking-[0.3em] text-primary uppercase mb-2">{activeTab}_Module</h1>
              <p className="text-[10px] font-code text-muted-foreground uppercase tracking-[0.2em]">Node: {user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-code uppercase tracking-widest text-accent">Active_Sync</span>
               </div>
               <img src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/100`} className="w-10 h-10 rounded-full border-2 border-primary/20 p-1 object-cover" alt="Admin" />
            </div>
          </header>

          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Projects", value: projects?.length || 0, icon: Package, color: "text-primary" },
                  { label: "Certs", value: certifications?.length || 0, icon: Award, color: "text-secondary" },
                  { label: "Gallery", value: galleryItems?.length || 0, icon: ImageIcon, color: "text-accent" },
                  { label: "Unread", value: messages?.filter(m => !m.isRead).length || 0, icon: MessageSquare, color: "text-destructive" },
                ].map((stat, i) => (
                  <Card key={i} className="glass-card border-primary/10 bg-card/30">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-[10px] font-headline tracking-widest text-muted-foreground uppercase">{stat.label}</CardTitle>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent><div className="text-3xl font-code text-primary">{stat.value}</div></CardContent>
                  </Card>
                ))}
              </div>

              <Card className="glass-card border-primary/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-headline tracking-widest uppercase">Latest_Transmissions</CardTitle>
                  <Button variant="ghost" className="text-[10px] font-code uppercase" onClick={() => setActiveTab("messages")}>View_All</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader className="text-[10px] uppercase font-code">
                      <TableRow><TableHead>Sender</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages?.slice(0, 5).map((msg) => (
                        <TableRow key={msg.id} className="hover:bg-primary/5">
                          <TableCell className="font-medium text-xs">{msg.name}</TableCell>
                          <TableCell className="text-xs">{msg.subject}</TableCell>
                          <TableCell>{msg.isRead ? <Badge variant="outline" className="text-[8px] uppercase">Read</Badge> : <Badge className="text-[8px] uppercase">New</Badge>}</TableCell>
                          <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => deleteDocumentNonBlocking(doc(db, "contactMessages", msg.id))}><Trash2 className="w-3 h-3 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6">
               <div className="grid grid-cols-1 gap-4">
                  {messages?.map((msg) => (
                    <Card key={msg.id} className={`glass-card border-primary/10 ${!msg.isRead ? 'border-l-4 border-l-primary' : ''}`}>
                       <div className="p-6 flex flex-col md:flex-row justify-between gap-6">
                          <div className="space-y-3 flex-1">
                             <div className="flex items-center gap-4">
                                <Badge variant="outline" className="font-code text-[10px]">{msg.receivedAt?.toDate().toLocaleDateString()}</Badge>
                                <span className="font-headline text-sm tracking-widest">{msg.name}</span>
                             </div>
                             <h3 className="font-headline text-xs text-primary">{msg.subject}</h3>
                             <p className="text-muted-foreground text-sm leading-relaxed">{msg.message}</p>
                          </div>
                          <div className="flex gap-2">
                             {!msg.isRead && <Button variant="outline" size="sm" onClick={() => updateDocumentNonBlocking(doc(db, "contactMessages", msg.id), { isRead: true })} className="font-code text-[10px]">Mark_Read</Button>}
                             <Button variant="outline" size="sm" onClick={() => deleteDocumentNonBlocking(doc(db, "contactMessages", msg.id))} className="text-destructive border-destructive/30 font-code text-[10px]">Purge</Button>
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="font-headline text-lg tracking-widest text-primary uppercase">Repository</h2>
                  <Button onClick={() => { setEditingProject(null); setIsProjectDialogOpen(true); }} className="bg-primary text-background font-headline tracking-widest text-[10px]"><Plus className="w-3 h-3 mr-2" /> NEW_PROJECT</Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {projects?.map((project) => (
                   <Card key={project.id} className="glass-card border-primary/10 overflow-hidden group">
                      <div className="aspect-video relative"><img src={project.imageUrl} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" alt={project.title} /></div>
                      <CardContent className="p-6">
                        <h3 className="font-headline text-sm tracking-widest mb-2 text-primary">{project.title}</h3>
                        <p className="text-muted-foreground text-xs line-clamp-2 mb-4">{project.shortDescription}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                           <Button variant="ghost" size="sm" onClick={() => { setEditingProject(project); setIsProjectDialogOpen(true); }} className="text-[10px] font-code uppercase">Edit</Button>
                           <Button variant="ghost" size="sm" onClick={() => deleteDocumentNonBlocking(doc(db, "projects", project.id))} className="text-[10px] font-code uppercase text-destructive">Delete</Button>
                        </div>
                      </CardContent>
                   </Card>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="certs" className="space-y-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="font-headline text-lg tracking-widest text-primary uppercase">Certifications</h2>
                  <Button onClick={() => { setEditingCert(null); setIsCertDialogOpen(true); }} className="bg-primary text-background font-headline tracking-widest text-[10px]"><Plus className="w-3 h-3 mr-2" /> ADD_CERT</Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {certifications?.map((cert) => (
                   <Card key={cert.id} className="glass-card border-primary/10 overflow-hidden group">
                      <div className="aspect-video relative bg-muted/20 flex items-center justify-center">
                        <img src={cert.imageUrl} className="max-h-full max-w-full object-contain p-4" alt={cert.title} />
                      </div>
                      <CardContent className="p-6">
                        <Badge className="mb-2 text-[8px] uppercase tracking-widest">{cert.category}</Badge>
                        <h3 className="font-headline text-sm tracking-widest mb-1 text-primary">{cert.title}</h3>
                        <p className="text-muted-foreground text-[10px] uppercase font-code">{cert.issuer}</p>
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-primary/10">
                           <Button variant="ghost" size="sm" onClick={() => { setEditingCert(cert); setIsCertDialogOpen(true); }} className="text-[10px] font-code uppercase"><Edit2 className="w-3 h-3 mr-2" />Edit</Button>
                           <Button variant="ghost" size="sm" onClick={() => deleteDocumentNonBlocking(doc(db, "certifications", cert.id))} className="text-[10px] font-code uppercase text-destructive"><Trash2 className="w-3 h-3 mr-2" />Delete</Button>
                        </div>
                      </CardContent>
                   </Card>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-8">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="font-headline text-lg tracking-widest text-primary uppercase">Gallery_Matrix</h2>
                  <Button onClick={() => setIsGalleryDialogOpen(true)} className="bg-primary text-background font-headline tracking-widest text-[10px]"><Plus className="w-3 h-3 mr-2" /> ADD_MEDIA</Button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {galleryItems?.map((item) => (
                   <div key={item.id} className="relative aspect-square group overflow-hidden rounded-lg border border-primary/10">
                      <img src={item.imageUrl} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" alt={item.title} />
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                         <span className="text-[10px] font-headline text-primary mb-2">{item.title}</span>
                         <Button variant="ghost" size="sm" onClick={() => deleteDocumentNonBlocking(doc(db, "galleryItems", item.id))} className="text-[8px] text-destructive uppercase"><Trash2 className="w-3 h-3 mr-1" /> Purge</Button>
                      </div>
                   </div>
                 ))}
               </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
               <div className="max-w-4xl mx-auto space-y-8">
                  <Card className="glass-card border-primary/10">
                    <CardHeader>
                      <CardTitle className="text-sm font-headline uppercase text-primary">Core_Identity</CardTitle>
                      <CardDescription className="text-[10px] font-code uppercase">Global site parameters and biographical data</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleUpdateSettings} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-code text-primary uppercase">System Tagline</Label>
                            <Input 
                              value={settingsForm.tagline} 
                              onChange={(e) => setSettingsForm({...settingsForm, tagline: e.target.value})}
                              placeholder="Engineering & Security" 
                              className="bg-background/50 border-primary/20" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-code text-primary uppercase">Contact Email</Label>
                            <Input 
                              value={settingsForm.contactEmail} 
                              onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                              placeholder="admin@example.com" 
                              className="bg-background/50 border-primary/20" 
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-code text-primary uppercase">Main Bio (About Section)</Label>
                          <Textarea 
                            value={settingsForm.bio} 
                            onChange={(e) => setSettingsForm({...settingsForm, bio: e.target.value})}
                            placeholder="Tell your story..." 
                            className="bg-background/50 border-primary/20 min-h-[150px]" 
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-code text-primary uppercase">GitHub URL</Label>
                            <Input 
                              value={settingsForm.socialGithubUrl} 
                              onChange={(e) => setSettingsForm({...settingsForm, socialGithubUrl: e.target.value})}
                              placeholder="https://github.com/..." 
                              className="bg-background/50 border-primary/20" 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-code text-primary uppercase">LinkedIn URL</Label>
                            <Input 
                              value={settingsForm.socialLinkedinUrl} 
                              onChange={(e) => setSettingsForm({...settingsForm, socialLinkedinUrl: e.target.value})}
                              placeholder="https://linkedin.com/in/..." 
                              className="bg-background/50 border-primary/20" 
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                           <div className="space-y-1">
                              <Label className="text-[10px] font-code text-primary uppercase">Availability Protocol</Label>
                              <p className="text-[9px] text-muted-foreground uppercase">Show "Available for Internship" badge on public site</p>
                           </div>
                           <Switch 
                             checked={settingsForm.availableForWork} 
                             onCheckedChange={(checked) => setSettingsForm({...settingsForm, availableForWork: checked})} 
                           />
                        </div>

                        <Button type="submit" className="w-full bg-primary text-background font-headline tracking-widest text-[10px] h-12">
                          <Save className="w-4 h-4 mr-2" /> SYNC_SITE_CORE
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
               </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="glass-card border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline tracking-widest text-primary uppercase">{editingProject ? 'UPDATE_PROJECT' : 'INITIALIZE_PROJECT'}</DialogTitle>
            <DialogDescription className="font-code text-[10px] uppercase">Configure repository node parameters</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProject} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase text-primary">Project Name</label>
                <Input 
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm({...projectForm, title: e.target.value})}
                  required 
                  className="bg-background/50 border-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase text-primary">Category</label>
                <select 
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({...projectForm, category: e.target.value})}
                  className="w-full bg-background/50 border border-primary/20 rounded-md p-2 text-sm text-foreground"
                >
                  <option value="webdev">Web Development</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="tools">Tools</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase text-primary flex items-center gap-1"><Github className="w-3 h-3" /> GitHub URL</label>
                <Input 
                  value={projectForm.githubUrl}
                  onChange={(e) => setProjectForm({...projectForm, githubUrl: e.target.value})}
                  placeholder="https://github.com/..." 
                  className="bg-background/50 border-primary/20" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-code uppercase text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Live URL</label>
                  <span className="text-[8px] font-code text-muted-foreground uppercase tracking-widest">[ OPTIONAL ]</span>
                </div>
                <Input 
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})}
                  placeholder="https://..." 
                  className="bg-background/50 border-primary/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase text-primary">Tech Stack (comma separated)</label>
              <Input 
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({...projectForm, techStack: e.target.value})}
                required 
                placeholder="React, Next.js, Firebase" 
                className="bg-background/50 border-primary/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase text-primary">Image URL</label>
              <Input 
                value={projectForm.imageUrl}
                onChange={(e) => setProjectForm({...projectForm, imageUrl: e.target.value})}
                className="bg-background/50 border-primary/20" 
                placeholder="https://..." 
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-code uppercase text-primary">Short Description</label>
                <Button 
                  type="button" 
                  onClick={handleAiGenerateDescription}
                  disabled={isAiLoading}
                  variant="ghost" 
                  className="h-6 text-[8px] font-code text-accent uppercase"
                >
                  {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Wand2 className="w-3 h-3 mr-1" />} AI_ASSIST
                </Button>
              </div>
              <Input 
                value={projectForm.shortDescription}
                onChange={(e) => setProjectForm({...projectForm, shortDescription: e.target.value})}
                required 
                className="bg-background/50 border-primary/20" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase text-primary">Long Description</label>
              <Textarea 
                value={projectForm.longDescription}
                onChange={(e) => setProjectForm({...projectForm, longDescription: e.target.value})}
                required 
                className="bg-background/50 border-primary/20 min-h-[100px]" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase text-primary">Status</label>
                <select 
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({...projectForm, status: e.target.value})}
                  className="w-full bg-background/50 border border-primary/20 rounded-md p-2 text-sm text-foreground"
                >
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input 
                  type="checkbox" 
                  checked={projectForm.featured}
                  onChange={(e) => setProjectForm({...projectForm, featured: e.target.checked})}
                  className="w-4 h-4 accent-primary" 
                />
                <label className="text-[10px] font-code uppercase text-primary">Featured Project</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-primary text-background font-headline tracking-widest uppercase">SYNC_TO_DATABASE</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cert Dialog */}
      <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
        <DialogContent className="glass-card border-primary/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline tracking-widest text-primary uppercase">Certification_Node</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCert} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Cert Title</label>
              <Input name="title" required defaultValue={editingCert?.title} className="bg-background/50 border-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase">Issuer</label>
                <Input name="issuer" required defaultValue={editingCert?.issuer} className="bg-background/50 border-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-code uppercase">Category</label>
                <Input name="category" required defaultValue={editingCert?.category || "Cybersecurity"} className="bg-background/50 border-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Date Issued</label>
              <Input name="dateIssued" type="date" required defaultValue={editingCert?.dateIssued} className="bg-background/50 border-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Credential URL</label>
              <Input name="credentialUrl" defaultValue={editingCert?.credentialUrl} className="bg-background/50 border-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Image URL</label>
              <Input name="imageUrl" defaultValue={editingCert?.imageUrl} className="bg-background/50 border-primary/20" />
            </div>
            <Button type="submit" className="w-full bg-primary text-background font-headline tracking-widest">LOG_CERTIFICATION</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gallery Dialog */}
      <Dialog open={isGalleryDialogOpen} onOpenChange={setIsGalleryDialogOpen}>
        <DialogContent className="glass-card border-primary/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline tracking-widest text-primary uppercase">Gallery_Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveGalleryItem} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Title / Caption</label>
              <Input name="title" required className="bg-background/50 border-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Image URL</label>
              <Input name="imageUrl" required className="bg-background/50 border-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-code uppercase">Category</label>
              <Input name="category" required className="bg-background/50 border-primary/20" placeholder="Events, Projects, etc." />
            </div>
            <Button type="submit" className="w-full bg-primary text-background font-headline tracking-widest">UPLOAD_TO_GRID</Button>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}