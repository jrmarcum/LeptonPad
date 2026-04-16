// Production entrypoint — used by Deno Deploy and `deno task serve:prod`.
// Serves the pre-built dist/ directory as a static site.
import { serveDir } from 'jsr:@std/http@1/file-server';

Deno.serve((req) => serveDir(req, { fsRoot: 'dist', quiet: true }));
