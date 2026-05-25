"use client";

import LandingNavbar from "@/components/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await register({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });

    if (result.success) {
      router.push("/onboarding");
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50/50 to-[hsl(var(--turmeric))]/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--paprika))_0%,transparent_25%),radial-gradient(circle_at_70%_80%,hsl(var(--turmeric))_0%,transparent_25%),radial-gradient(circle_at_40%_60%,hsl(var(--sage))_0%,transparent_20%)] opacity-8" />

      <LandingNavbar />

      <main className="relative flex-1 flex items-center justify-center p-4 py-10">
        <Card className="w-full max-w-lg shadow-cozy border-2 border-[hsl(var(--paprika))]/40 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--paprika))]/15 to-[hsl(var(--turmeric))]/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-[hsl(var(--paprika))]" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              Start your cooking journey
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create an account and get your first adaptive meal plan in
              minutes.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
                  />
                </div>
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
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[hsl(var(--paprika))] to-orange-600 hover:from-orange-600 hover:to-[hsl(var(--paprika))] text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? "Registering..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <div className="text-center pb-6 -mt-2 text-sm">
            <span className="text-muted-foreground">
              Already have an account?
            </span>
            <Button
              variant="link"
              className="ml-1 text-[hsl(var(--paprika))] font-medium underline-offset-2 hover:underline"
              onClick={() => router.push("/login")}
              aria-label="Go to Login"
            >
              Login
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
