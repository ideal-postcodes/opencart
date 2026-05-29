---
name: test
description: Run tests for the OpenCart extension. Use when running Cypress e2e tests or validating the extension.
---

# Test OpenCart Extension

## Test Commands

```bash
# Full test suite (bootstrap + cypress + cleanup)
npm test

# Open Cypress interactively
npm run test:open

# Run Cypress only (requires running container)
npm run cypress
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

- `cypress/` - Cypress test files
- `cypress.config.ts` - Cypress configuration
- `docker-compose.yml` - Container setup
- `Dockerfile` - OpenCart container definition
