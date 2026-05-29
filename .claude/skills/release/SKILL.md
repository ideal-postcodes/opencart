---
name: release
description: Release a new version of the OpenCart extension. Use when preparing or publishing releases via semantic-release.
---

# Release OpenCart Extension

## Release Process

Uses semantic-release for automated versioning based on conventional commits.

```bash
npm run semantic-release
```

## Release Configuration

See `release.config.js` for plugins:
- **commit-analyzer** - Determines version bump from commits
- **release-notes-generator** - Generates changelog
- **changelog** - Updates CHANGELOG.md
- **replace** - Updates version in `src/install.json`
- **git** - Commits release changes
- **github** - Creates GitHub release with `idealpostcodes.ocmod.zip`

## Commit Message Format

Follow conventional commits:
- `feat:` - New feature (minor bump)
- `fix:` - Bug fix (patch bump)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (major bump)

## Release Artifacts

- `idealpostcodes.ocmod.zip` - Installable OpenCart extension
- `CHANGELOG.md` - Version history
- GitHub Release with attached zip
