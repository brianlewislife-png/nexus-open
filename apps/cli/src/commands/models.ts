import { listModels, listProviders } from '../client';
import { dim, error, printTable } from '../helpers';

export async function models(providerSlug?: string): Promise<void> {
  try {
    const providers = await listProviders();

    if (providerSlug) {
      const provider = providers.items.find((p) => p.slug === providerSlug);
      if (!provider) {
        error(`Provider not found: ${providerSlug}`);
        process.exitCode = 1;
        return;
      }
      await printModels(provider.id, provider.name);
      return;
    }

    const grouped = new Map<string, string[]>();
    const modelRes = await listModels();
    for (const m of modelRes.items) {
      const key = m.provider?.name ?? 'Unknown';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(m.name);
    }

    for (const provider of providers.items) {
      dim('');
      dim(`▸ ${provider.name}  (${provider.slug})   ${provider.isActive ? 'ACTIVE' : 'INACTIVE'}`);
      dim('');
      const list = grouped.get(provider.name) ?? [];
      if (list.length === 0) {
        dim('   (no models configured)');
      }
      for (const name of list) {
        dim(`   • ${name}`);
      }
    }
    dim('');
  } catch (err) {
    error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

async function printModels(providerId: string, providerName: string): Promise<void> {
  const res = await listModels(providerId);
  if (res.items.length === 0) {
    error(`No models configured for ${providerName}`);
    return;
  }
  printTable(
    ['ID', 'MODEL', 'ACTIVE'],
    res.items.map((m) => [m.id.slice(0, 8), m.name, m.isActive ? 'yes' : 'no'])
  );
}