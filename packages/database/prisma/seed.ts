import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Providers ──────────────────────────────────────────────────────────

  const openai = await prisma.provider.upsert({
    where: { slug: "openai" },
    update: {},
    create: {
      name: "OpenAI",
      slug: "openai",
      baseUrl: "https://api.openai.com/v1",
      isActive: true,
      config: {
        apiVersion: "v1",
        supportsStreaming: true,
        supportsFunctions: true,
      },
    },
  });

  const google = await prisma.provider.upsert({
    where: { slug: "google-gemini" },
    update: {},
    create: {
      name: "Google Gemini",
      slug: "google-gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1",
      isActive: true,
      config: {
        apiVersion: "v1",
        supportsStreaming: true,
        supportsFunctions: true,
      },
    },
  });

  const mistral = await prisma.provider.upsert({
    where: { slug: "mistral" },
    update: {},
    create: {
      name: "Mistral AI",
      slug: "mistral",
      baseUrl: "https://api.mistral.ai/v1",
      isActive: true,
      config: {
        apiVersion: "v1",
        supportsStreaming: true,
        supportsFunctions: true,
      },
    },
  });

  const ollama = await prisma.provider.upsert({
    where: { slug: "ollama" },
    update: {},
    create: {
      name: "Ollama",
      slug: "ollama",
      baseUrl: "http://localhost:11434",
      isActive: true,
      config: {
        supportsStreaming: true,
        supportsFunctions: false,
        local: true,
      },
    },
  });

  console.log("Created providers:", {
    openai: openai.id,
    google: google.id,
    mistral: mistral.id,
    ollama: ollama.id,
  });

  // ─── Models ─────────────────────────────────────────────────────────────

  const openaiModels = [
    {
      name: "GPT-4o",
      slug: "gpt-4o",
      parameters: { maxTokens: 128000, temperature: 0.7 },
    },
    {
      name: "GPT-4o Mini",
      slug: "gpt-4o-mini",
      parameters: { maxTokens: 128000, temperature: 0.7 },
    },
    {
      name: "GPT-4 Turbo",
      slug: "gpt-4-turbo",
      parameters: { maxTokens: 128000, temperature: 0.7 },
    },
    {
      name: "o1-preview",
      slug: "o1-preview",
      parameters: { maxTokens: 128000, temperature: 1 },
    },
    {
      name: "o1-mini",
      slug: "o1-mini",
      parameters: { maxTokens: 128000, temperature: 1 },
    },
  ];

  const googleModels = [
    {
      name: "Gemini 1.5 Pro",
      slug: "gemini-1.5-pro",
      parameters: { maxTokens: 2097152, temperature: 0.7 },
    },
    {
      name: "Gemini 1.5 Flash",
      slug: "gemini-1.5-flash",
      parameters: { maxTokens: 1048576, temperature: 0.7 },
    },
    {
      name: "Gemini 2.0 Flash",
      slug: "gemini-2.0-flash",
      parameters: { maxTokens: 1048576, temperature: 0.7 },
    },
  ];

  const mistralModels = [
    {
      name: "Mistral Large",
      slug: "mistral-large-latest",
      parameters: { maxTokens: 128000, temperature: 0.7 },
    },
    {
      name: "Mistral Small",
      slug: "mistral-small-latest",
      parameters: { maxTokens: 32000, temperature: 0.7 },
    },
    {
      name: "Codestral",
      slug: "codestral-latest",
      parameters: { maxTokens: 32000, temperature: 0.3 },
    },
  ];

  const ollamaModels = [
    {
      name: "Llama 3.1 8B",
      slug: "llama3.1:8b",
      parameters: { maxTokens: 8192, temperature: 0.7 },
    },
    {
      name: "Llama 3.1 70B",
      slug: "llama3.1:70b",
      parameters: { maxTokens: 8192, temperature: 0.7 },
    },
    {
      name: "CodeLlama 13B",
      slug: "codellama:13b",
      parameters: { maxTokens: 8192, temperature: 0.3 },
    },
    {
      name: "Mistral 7B",
      slug: "mistral:7b",
      parameters: { maxTokens: 8192, temperature: 0.7 },
    },
  ];

  const allModelData = [
    ...openaiModels.map((m) => ({ ...m, providerId: openai.id })),
    ...googleModels.map((m) => ({ ...m, providerId: google.id })),
    ...mistralModels.map((m) => ({ ...m, providerId: mistral.id })),
    ...ollamaModels.map((m) => ({ ...m, providerId: ollama.id })),
  ];

  for (const model of allModelData) {
    await prisma.model.upsert({
      where: {
        providerId_slug: {
          providerId: model.providerId,
          slug: model.slug,
        },
      },
      update: {
        name: model.name,
        parameters: model.parameters,
      },
      create: {
        name: model.name,
        slug: model.slug,
        providerId: model.providerId,
        parameters: model.parameters,
        isActive: true,
      },
    });
  }

  console.log(
    `Created ${allModelData.length} models across ${4} providers`
  );

  // ─── Default Settings ───────────────────────────────────────────────────

  await prisma.setting.upsert({
    where: { key: "welcome_seen" },
    update: { value: false },
    create: {
      key: "welcome_seen",
      value: false,
    },
  });

  console.log("Created default settings");

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
