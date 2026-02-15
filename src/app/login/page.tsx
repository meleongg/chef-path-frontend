"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await login({ email, password });

    if (result.success) {
      // Navigate to weekly-plan - AuthGuard will redirect to onboarding if needed
      router.push("/weekly-plan");
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10">
      <Card className="w-full max-w-md shadow-cozy border-2 border-[hsl(var(--paprika))] bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Login to ChefPath
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password">
                Password <span className="text-red-600">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[hsl(var(--sage))] text-primary font-semibold border border-[hsl(var(--paprika))] shadow transition-colors duration-200 hover:bg-[hsl(var(--sage))]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <div className="text-center mt-4">
          <span className="text-muted-foreground">Don't have an account?</span>
          <Button
            variant="link"
            className="ml-2 text-primary underline"
            onClick={() => router.push("/register")}
            aria-label="Go to Register"
          >
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
}
