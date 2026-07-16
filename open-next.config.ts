import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({});

const openNextConfig = {
  ...config,
  buildCommand: "npx next build --webpack",
};

export default openNextConfig;
