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
  const [username, setUsername] = useState("");
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
      const res = await api.login({ username, password });
      if (res.access_token && res.user) {
        localStorage.setItem("chefpath_token", res.access_token);
        // Set user in context
        await loadUser(res.user.id);
        router.push("/weekly-plan");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
              <Label htmlFor="username">Username or Email</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1"
                autoComplete="username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
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
