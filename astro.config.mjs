import { defineConfig } from "astro/config";

import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkRehype: {
      allowDangerousHtml: true,
      // This is fine because we are using rehypeSanitize to sanitize XSS.
      // See https://github.com/remarkjs/remark-rehype?tab=readme-ov-file#example-supporting-html-in-markdown-properly
    },
    remarkPlugins: [
      remarkParse,
      remarkRehype,
      rehypeRaw,
      rehypeSanitize,
      rehypeStringify,
    ],
  },
});
