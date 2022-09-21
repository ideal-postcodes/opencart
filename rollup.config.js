import commonjs from "@rollup/plugin-commonjs";
//import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-ts";
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
      file: "./src/upload/catalog/view/javascript/opencart.js",
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
      ts({
        transpiler: "babel",
        browserslist: [targets],
        babelConfig: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets
              },
            ],
          ],
        },
      }),
      //terser(terserConfig),
    ],
  },
];
