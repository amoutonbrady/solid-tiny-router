import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

const extensions = [".tsx", ".ts"];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/solid-tiny-router.tsx",
  treeshake: true,
  external: [/@babel\/runtime/, /solid-js/, /regexparam/, /mitt/],
  output: [
    {
      name: "solid-tiny-router",
      file: "dist/solid-tiny-router.cjs.js",
      format: "cjs",
    },
    {
      name: "solid-tiny-router",
      file: "dist/solid-tiny-router.esm.js",
      format: "esm",
    },
  ],
  plugins: [
    resolve({
      extensions,
    }),
    babel({
      extensions,
      babelHelpers: "runtime",
      exclude: "node_modules/**",
      presets: ["babel-preset-solid", "@babel/preset-typescript"],
      plugins: ["@babel/plugin-transform-runtime"],
    }),
  ],
};

export default config;
