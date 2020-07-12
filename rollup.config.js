import { babel } from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

const extensions = [".tsx"];

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: "src/main.tsx",
  treeshake: true,
  external: ["solid-js", "solid-js/dom", "history", "regexparam"],
  output: [
    {
      name: "solid-tiny-router",
      file: "dist/main.cjs.js",
      format: "cjs",
    },
    {
      name: "solid-tiny-router",
      file: "dist/main.esm.js",
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
    terser(),
  ],
};

export default config;
