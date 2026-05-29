---
name: test
description: Run tests for the OpenCart extension. Use when running Playwright e2e tests or validating the extension.
---

# Test OpenCart Extension

## Test Commands

```bash
# Full test suite (bootstrap + playwright + cleanup)
npm test

# Open Playwright UI
npm run playwright:ui

# Run Playwright only (requires running container)
npm run playwright

# Run headed (visible browser)
npm run playwright:headed
```

## Test Environment

Uses Docker Compose to spin up:
- OpenCart web container
- MySQL database

## Setup for Testing

```bash
# Start containers
make bootstrap

# Or step by step:
make up        # Start containers
make init      # Initialize OpenCart
make setup-extension  # Install extension
```

## Cleanup

```bash
make down      # Stop and remove containers
```

## Key Files

- `tests/` - Playwright test files
- `playwright.config.ts` - Playwright configuration
- `docker-compose.yml` - Container setup
- `Dockerfile` - OpenCart container definition
