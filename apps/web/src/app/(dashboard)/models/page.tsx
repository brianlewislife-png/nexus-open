"use client";

import * as React from "react";
import { Cpu, CheckCircle2, Circle, Server, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTitle, ApiError, LoadingCards, EmptyState } from "@/components/shared/state";
import { useApiData } from "@/lib/hooks";
import type { Provider, Model } from "@/lib/api";

const providerMeta: Record<string, { envKey: string; note?: string }> = {
  openai: { envKey: "OPENAI_API_KEY" },
  gemini: { envKey: "GEMINI_API_KEY" },
  mistral: { envKey: "MISTRAL_API_KEY" },
  ollama: {
    envKey: "OLLAMA_BASE_URL",
    note: "Local inference via Ollama. Make sure the Ollama server is running and reachable.",
  },
};

export default function ModelsPage() {
  const { data: providers, error, loading, reload } = useApiData<Provider[]>("/api/providers");

  const list = React.useMemo(() => {
    if (!providers) return null;
    return providers
      .map((provider) => ({
        provider,
        meta: providerMeta[provider.slug] ?? {
          envKey: `PROVIDER_${provider.slug.toUpperCase()}_KEY`,
          note: undefined,
        },
      }))
      .sort((a, b) => {
        const order = ["openai", "gemini", "mistral", "ollama"];
        const ai = order.indexOf(a.provider.slug);
        const bi = order.indexOf(b.provider.slug);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [providers]);

  return (
    <div className="space-y-6 p-6">
      <PageTitle
        title="Models"
        description="Providers and the models exposed by your backend."
      />

      {loading ? (
        <LoadingCards />
      ) : error ? (
        <ApiError onRetry={reload} />
      ) : !list || list.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title="No providers found"
          description="Providers are seeded by the API. Check that the backend database was migrated and seeded."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {list.map(({ provider, meta }) => {
            const configured = provider.configured ?? (provider.models?.length ?? 0) > 0;
            const providerLabel =
              provider.name.charAt(0).toUpperCase() + provider.name.slice(1);
            return (
              <Card key={provider.id} className="card-glass">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-indigo-500/15 p-2 text-indigo-400">
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{providerLabel}</CardTitle>
                        <CardDescription className="font-mono text-xs">
                          {meta.envKey}
                        </CardDescription>
                      </div>
                    </div>
                    {configured ? (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Configured
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Circle className="mr-1 h-3 w-3" /> Not configured
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.baseUrl && (
                    <div className="rounded-lg border border-white/[0.05] bg-black/30 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">Base URL: </span>
                      <code className="text-indigo-300">{provider.baseUrl}</code>
                    </div>
                  )}
                  {meta.note && <p className="text-xs text-muted-foreground">{meta.note}</p>}
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                      Available models
                    </div>
                    {provider.models && provider.models.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {provider.models.map((model: Model) => (
                          <Badge key={model.id} variant="outline">
                            {model.name}
                            {typeof model.parameters === "object" &&
                              model.parameters !== null &&
                              "contextLength" in model.parameters &&
                              model.parameters.contextLength != null && (
                                <>
                                  {" "}
                                  · {Number(model.parameters.contextLength).toLocaleString()} ctx
                                </>
                              )}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No models listed for this provider.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ExternalLink className="h-4 w-4 text-indigo-400" /> How model configuration works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            NEXUS never stores provider API keys in its database. The API reads them from its
            environment:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <code className="text-indigo-300">OPENAI_API_KEY</code> — OpenAI
            </li>
            <li>
              <code className="text-indigo-300">GEMINI_API_KEY</code> — Google Gemini
            </li>
            <li>
              <code className="text-indigo-300">MISTRAL_API_KEY</code> — Mistral
            </li>
            <li>
              <code className="text-indigo-300">OLLAMA_BASE_URL</code> — local Ollama server
              (defaults to <code className="text-indigo-300">http://localhost:11434</code>)
            </li>
          </ul>
          <p>
            Set them in <code className="text-indigo-300">.env</code> (copied from{" "}
            <code className="text-indigo-300">.env.example</code>) and run{" "}
            <code className="text-indigo-300">docker compose up -d</code>. Missing keys surface as a
            clear error the moment an agent tries to call the provider.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}