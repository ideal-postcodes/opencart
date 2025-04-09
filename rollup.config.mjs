import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

const banner = `/**
 * @license
 * Ideal Postcodes <https://ideal-postcodes.co.uk>
 * OpenCart Integration
 * Copyright IDDQD Limited, all rights reserved
 */`;

// Configure terser to ignore build info banner
const terserConfig = {
  output: {
    comments: (_, { value, type }) => {
      if (type === "comment2") return /@license/i.test(value);
    },
  },
};

const targets = "ie 11";

export default [
  {
    input: "./lib/index.ts",
    output: {
      file: "./src/catalog/view/javascript/opencart.js",
      banner,
      format: "iife",
      exports: "named",
      name: "IdealPostcodes"
    },
    plugins: [
      json(),
      nodeResolve({
        extensions: [".js", ".ts"],
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
          target: 'es5',
          module: 'esnext',
          lib: ['dom', 'es2015'],
        }
      }),
      terser(terserConfig),
    ],
  },
];
