// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // TEMPORARY: previewing on the raw github.io project URL before DNS for
  // fellowshell.com is pointed at GitHub Pages. Once DNS is live and the
  // custom domain is set in Settings -> Pages, switch this back to:
  //   site: 'https://fellowshell.com',
  // and delete the `base` line below (GitHub Pages then serves this repo
  // at the domain root, not under /Fellowshell-site/).
  site: 'https://fellowshell.github.io',
  base: '/Fellowshell-site',
  integrations: [react()]
});