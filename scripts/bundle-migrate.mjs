// Bundle the migrator (Drizzle + postgres-js + generated SQL) into a
// self-contained migrate.cjs that runs before the server without needing
// runtime node_modules. Loaded by `initCommands` in zerops.yaml (prod).
import { build } from 'esbuild'

await build({
  entryPoints: ['src/db/migrate.ts'],
  outfile: 'migrate.cjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  external: [],
  loader: { '.sql': 'text' },
  logLevel: 'info',
})
