import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

const extensions = [".tsx"];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/solid-tiny-router.tsx",
  treeshake: true,
  external: ["solid-js", "solid-js/dom", "history", "regexparam"],
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
      presets: ["babel-preset-solid", "@babel/preset-typescript"],
      babelHelpers: "bundled",
      extensions,
    }),
  ],
};

export default config;
