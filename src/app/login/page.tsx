"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loadUser } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login({ email, password });
      if (res.access_token && res.user) {
        localStorage.setItem("chefpath_token", res.access_token);
        // Set user in context
        const user = await loadUser(res.user.id);
        const needsOnboarding =
          !user?.frequency ||
          !user?.cuisine ||
          !user?.skill_level ||
          !user?.user_goal;
        if (needsOnboarding) {
          router.push("/onboarding");
        } else {
          router.push("/weekly-plan");
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      let friendlyError = "Login failed. Please try again.";
      if (err.status == 401) {
        friendlyError = "Invalid email or password. Please try again.";
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-auto shadow-lg border border-[hsl(var(--paprika))]">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Login
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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
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
