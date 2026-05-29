---
name: build
description: Build the OpenCart extension. Use when compiling TypeScript, bundling assets, or creating the .ocmod.zip package.
---

# Build OpenCart Extension

## Quick Build Commands

```bash
# Build JavaScript assets (production)
npm run build

# Watch mode for development
npm run watch

# Bundle the extension (.ocmod.zip)
make bundle
```

## Build Process

1. **TypeScript Compilation**: Rollup compiles `lib/*.ts` to JavaScript
2. **Output**: Compiled JS goes to `src/catalog/view/javascript/`
3. **Bundle**: Creates `idealpostcodes.ocmod.zip` from `src/` directory

## Key Files

- `rollup.config.mjs` - Build configuration
- `lib/` - TypeScript source files
- `src/` - OpenCart extension structure (admin, catalog, install.json)

## Dependencies

Uses `@ideal-postcodes/address-finder` and `@ideal-postcodes/postcode-lookup` libraries.
