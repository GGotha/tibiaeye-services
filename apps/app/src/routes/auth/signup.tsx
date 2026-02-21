import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/auth/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const key = await register({ email, password, name: name || undefined });
      if (key) {
        setLicenseKey(key);
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!licenseKey) return;
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show license key after successful registration
  if (licenseKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4 flex items-center justify-center text-black text-xl font-bold">
              !
            </div>
            <CardTitle className="text-2xl text-white">Save your API Key</CardTitle>
            <CardDescription className="text-slate-400">
              This key will only be shown once. Copy it and add to your bot's .env file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              Save this key now! You won't be able to see it again.
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">TELEMETRY_API_KEY</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={licenseKey}
                  className="bg-slate-800 border-slate-700 text-emerald-400 font-mono text-sm"
                />
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-md bg-slate-800 border border-slate-700">
              <p className="text-slate-400 text-xs mb-2">Add to your bot's .env file:</p>
              <code className="text-emerald-400 text-xs font-mono break-all">
                TELEMETRY_API_KEY={licenseKey}
              </code>
            </div>

            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              I saved my key, continue to dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 mb-4" />
          <CardTitle className="text-2xl text-white">Create an account</CardTitle>
          <CardDescription className="text-slate-400">
            Start tracking your Tibia sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Name (optional)
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
