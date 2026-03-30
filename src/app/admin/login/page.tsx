
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User as UserIcon, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/admin/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // For the prototype stage, we also allow a bypass if the user types 'admin' / 'password'
      // This ensures you aren't locked out before creating a Firebase user.
      if (email === "admin" && password === "password") {
        toast({
          title: "MOCK_AUTHENTICATION_SUCCESS",
          description: "Simulation mode active. Accessing dashboard.",
        });
        router.push("/admin/dashboard");
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "AUTHENTICATION_SUCCESSFUL",
        description: "System access granted. Welcome back, Admin.",
      });
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "AUTHENTICATION_FAILED",
        description: err.message || "Invalid security key or credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="glass-card p-10 border-primary/30 shadow-[0_0_50px_rgba(0,212,255,0.1)]">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <ShieldCheck className="w-8 h-8 text-background" />
            </div>
            <h1 className="font-headline text-2xl tracking-[0.2em] text-center">SYSTEM_ACCESS</h1>
            <p className="font-code text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 bg-background/50 border-primary/20 h-12 font-code placeholder:text-muted-foreground" 
                  placeholder="ADMIN_EMAIL" 
                  required 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 bg-background/50 border-primary/20 h-12 font-code placeholder:text-muted-foreground" 
                  placeholder="SECURITY_KEY" 
                  required 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-primary text-background font-headline tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98]"
            >
              {isLoading ? "DECRYPTING..." : "INITIALIZE_LOGIN"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-primary/10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-primary/40 font-code text-[8px] uppercase tracking-[0.3em]">
              <Terminal className="w-3 h-3" />
              <span>SECURE_SESSION_ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
