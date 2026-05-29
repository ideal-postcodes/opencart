# Ideal Postcodes OpenCart Extension

UK Address Search and Validation extension for OpenCart 4.x. Integrates `@ideal-postcodes/address-finder` and `@ideal-postcodes/postcode-lookup` for UK address autocomplete and postcode lookup.

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build JS assets (production) |
| `npm run watch` | Watch mode for development |
| `make bootstrap` | Start dev environment |
| `make down` | Stop containers |
| `make bundle` | Create .ocmod.zip (run `npm run build` first) |
| `npm test` | Run full test suite |
| `npm run playwright:ui` | Open Playwright UI |

## Project Structure

```
lib/           # TypeScript source (compiled by Rollup)
src/
├── admin/     # Admin panel (controller, language, view)
├── catalog/   # Storefront (controller, language, model, view, JS)
└── install.json
tests/         # Playwright E2E tests
docker/        # Docker setup scripts
```

## Conventions

- **OpenCart 4 namespaces**: `Opencart\Admin\Controller\Extension\idealpostcodes\Module`
- **Language keys**: Use `entry_*` prefix for form fields, `text_*` for labels
- **Error handling**: Wrap install/uninstall in try-catch with logging
- **Security**: Use Twig's `json_encode()` filter for JS data (it's interpolated as object literals inside `<script>`, so must be escape-safe to prevent XSS)

## Skills

- `/build` - Build and bundle the extension
- `/test` - Run Playwright tests
- `/release` - Semantic release process
