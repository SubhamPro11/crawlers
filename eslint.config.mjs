import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.open-next/**",
      "**/out/**",
      "**/build/**",
      "next-env.d.ts",
      "inspect_tools.js",
      "scripts/**"
    ]
  },
  ...nextVitals,
  ...nextTs
];

export default eslintConfig;
