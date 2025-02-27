"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const error = searchParams.get("error");

    if (error) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to authenticate with Google. Please try again.",
      });
      router.push("/");
      return;
    }

    if (token && userId) {
      // Store authentication data
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      
      toast({
        title: "Success",
        description: "Successfully signed in with Google",
      });
      
      // Redirect to dashboard
      router.push("/");
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Missing authentication data. Please try again.",
      });
      router.push("/");
    }
  }, [router, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
        <p className="text-muted-foreground">Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}