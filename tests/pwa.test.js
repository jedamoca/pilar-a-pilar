import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readProjectFile = (relativePath) => readFile(path.join(projectRoot, relativePath), 'utf8');

test('el manifiesto PWA contiene metadatos de instalación y los iconos requeridos', async () => {
  const manifest = JSON.parse(await readProjectFile('manifest.webmanifest'));
  assert.equal(manifest.name, 'Pilar a Pilar');
  assert.equal(manifest.short_name, 'Pilar a Pilar');
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.some((icon) => icon.sizes === '192x192' && icon.purpose === 'any'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'any'));
  assert.ok(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable'));
  for (const icon of manifest.icons) await access(path.join(projectRoot, icon.src.replace(/^\.\//, '')));
});

test('index enlaza el manifiesto y ofrece una acción para instalar la aplicación', async () => {
  const html = await readProjectFile('index.html');
  assert.match(html, /rel="manifest" href="\.\/manifest\.webmanifest"/);
  assert.match(html, /id="install-app-button"/);
  assert.match(html, /src="\.\/js\/app\.js"/);
});

test('el service worker precachea todos los módulos y recursos estáticos enumerados', async () => {
  const source = await readProjectFile('sw.js');
  const match = source.match(/const APP_SHELL = \[([\s\S]*?)\];/);
  assert.ok(match, 'APP_SHELL debe estar definido');
  const paths = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
  assert.ok(paths.includes('./index.html'));
  assert.ok(paths.includes('./manifest.webmanifest'));
  assert.ok(paths.includes('./js/pwa.js'));
  for (const relativePath of paths) {
    const normalPath = relativePath === './' ? 'index.html' : relativePath.replace(/^\.\//, '');
    await access(path.join(projectRoot, normalPath));
  }
  assert.match(source, /request\.mode === 'navigate'/);
  assert.match(source, /caches\.delete\(name\)/);
});
