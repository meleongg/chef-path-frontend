"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks";
import { api } from "@/lib/api";
import type { RegisterRequest } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, isLoading, error: userError, loadUser } = useUser();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload: RegisterRequest = {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      };
      const res = await api.register(payload);
      if (res && res.success && res.access_token && res.user) {
        localStorage.setItem("chefpath_token", res.access_token);
        await loadUser(res.user.id);
        router.push("/onboarding");
      } else {
        setError(res?.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[hsl(var(--paprika))]/10 via-[hsl(var(--sage))]/10 to-[hsl(var(--turmeric))]/10">
      <Card className="w-full max-w-md shadow-cozy border-2 border-[hsl(var(--paprika))] bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary text-center">
            Register for ChefPath
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleRegister}>
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="mt-1"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-600">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="mt-1"
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm font-medium text-center">
                {error === "Registration failed." &&
                  "Registration failed. Please check your details and try again."}
                {error === "Invalid response from server." &&
                  "Something went wrong. Please try again later."}
                {error !== "Registration failed." &&
                  error !== "Invalid response from server." &&
                  error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-[hsl(var(--sage))] text-primary font-semibold border border-[hsl(var(--paprika))] shadow transition-colors duration-200 hover:bg-[hsl(var(--sage))]/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--paprika))]"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <div className="text-center mt-4">
          <span className="text-muted-foreground">
            Already have an account?
          </span>
          <Button
            variant="link"
            className="ml-2 text-primary underline"
            onClick={() => router.push("/login")}
            aria-label="Go to Login"
          >
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
