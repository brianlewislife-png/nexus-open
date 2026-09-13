"use client";

import * as React from "react";
import { Settings, Server, CheckCircle2, Circle, RefreshCcw, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageTitle, ApiError, LoadingList } from "@/components/shared/state";
import { useApiData } from "@/lib/hooks";
import { apiPut } from "@/lib/api";
import type { Provider } from "@/lib/api";

export default function SettingsPage() {
  const {
    data: providers,
    error,
    loading,
    reload,
  } = useApiData<Provider[]>("/api/providers");

  const [apiUrl, setApiUrl] = React.useState(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  );
  const [resetting, setResetting] = React.useState(false);
  const [resetDone, setResetDone] = React.useState(false);

  const handleResetWelcome = async () => {
    setResetting(true);
    setResetDone(false);
    try {
      await apiPut("/api/settings/welcome_seen", { value: "false" });
      setResetDone(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const res = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/health`);
      if (res.ok) {
        alert("API reachable");
      } else {
        const fallback = await fetch(`${apiUrl.replace(/\/+$/, "")}/health`);
        alert(fallback.ok ? "API reachable" : `API responded with ${res.status}`);
      }
    } catch {
      alert("API not reachable at " + apiUrl);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle title="Settings" description="Configure how NEXUS behaves in your workspace." />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="h-4 w-4 text-indigo-400" /> General
              </CardTitle>
              <CardDescription>Connection defaults and onboarding state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="api-url">NEXUS API base URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:3001"
                  />
                  <Button variant="outline" onClick={handleTestConnection} type="button">
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Read from <code className="text-indigo-300">NEXT_PUBLIC_API_URL</code>. Defaults to{" "}
                  <code className="text-indigo-300">http://localhost:3001</code>.
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Welcome screen</div>
                  <p className="text-xs text-muted-foreground">
                    Show the onboarding screen on next visit.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleResetWelcome} disabled={resetting}>
                  {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                  Reset
                </Button>
              </div>
              {resetDone && (
                <p className="text-xs text-emerald-400">
                  Done. NEXUS will show the welcome screen next time you open the dashboard.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-indigo-400" /> About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">NEXUS, Open Source AI Workspace</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Edition</span>
                <span className="font-medium">Special Anniversary Edition</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Release</span>
                <span className="font-medium">September 13, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Author</span>
                <span className="font-medium">Brian Lewis</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-indigo-400" /> Providers
            </CardTitle>
            <CardDescription>
              API keys are read from the backend environment. NEXUS never stores them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingList rows={4} />
            ) : error ? (
              <ApiError onRetry={reload} />
            ) : (
              <div className="space-y-3">
                {providers && providers.length > 0 ? (
                  providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="flex items-center justify-between rounded-lg border border-white/[0.05] px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{provider.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {provider.models.length} available model
                          {provider.models.length === 1 ? "" : "s"}
                        </div>
                      </div>
                      {provider.configured ? (
                        <Badge variant="success">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Configured
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Circle className="mr-1 h-3 w-3" /> Not configured
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    The API did not report any providers. Check your backend configuration.
                  </p>
                )}
                <p className="pt-1 text-xs text-muted-foreground">
                  Set <code className="text-indigo-300">OPENAI_API_KEY</code>,{" "}
                  <code className="text-indigo-300">GEMINI_API_KEY</code>,{" "}
                  <code className="text-indigo-300">MISTRAL_API_KEY</code> or{" "}
                  <code className="text-indigo-300">OLLAMA_BASE_URL</code> in{" "}
                  <code className="text-indigo-300">.env</code> and restart the API.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}