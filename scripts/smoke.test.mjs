import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

test('@nexus/shared exports permission constants and utilities', () => {
  const shared = require('../packages/shared/dist/index.js');
  assert.ok(shared.Permission);
  assert.ok(shared.PERMISSIONS && shared.PERMISSIONS.length > 0);
  assert.ok(typeof shared.slugify === 'function');
  assert.ok(typeof shared.generateId === 'function');
  assert.equal(shared.slugify('Hello World'), 'hello-world');
});

test('@nexus/shared validation helpers', () => {
  const shared = require('../packages/shared/dist/index.js');
  assert.equal(shared.isEmail('a@b.com'), true);
  assert.equal(shared.isEmail('not-an-email'), false);
  assert.equal(shared.isUrl('https://example.com'), true);
});

test('@nexus/ai factory rejects unknown providers gracefully', async () => {
  const ai = require('../packages/ai/dist/index.js');
  await assert.rejects(
    async () =>
      await ai.createProvider('does-not-exist', { model: 'x' }),
    /Unknown AI provider/i
  );
});

test('@nexus/ai lists the right provider slugs', () => {
  const ai = require('../packages/ai/dist/index.js');
  const slugs = Object.keys(ai.providers);
  for (const slug of ['openai', 'gemini', 'mistral', 'ollama']) {
    assert.ok(slugs.includes(slug), `missing provider ${slug}`);
  }
});