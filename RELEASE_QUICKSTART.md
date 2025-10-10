# 🚀 Release Quickstart

## One Command Release

```bash
pnpm release
```

This automatically:
1. Analyzes your commits
2. Calculates version bump
3. Updates CHANGELOG.md
4. Creates git tag
5. Publishes to npm
6. Creates GitHub release

## Commit Message Format

Use conventional commits for automatic versioning:

```bash
# Patch (0.1.0 → 0.1.1) - Bug fixes
git commit -m "fix: description"

# Minor (0.1.0 → 0.2.0) - New features
git commit -m "feat: description"

# Major (0.1.0 → 1.0.0) - Breaking changes
git commit -m "feat!: description

BREAKING CHANGE: explanation"
```

## Full Workflow

```bash
# 1. Make changes
# ... edit files ...

# 2. Commit with conventional format
git add .
git commit -m "feat: add progressive output to CLI"
git push origin master

# 3. Release
pnpm release
```

Done! 🎉

## Before First Release

Make sure you're logged in to npm:
```bash
npm login
```

## Test Before Releasing

```bash
npx semantic-release --dry-run --no-ci
```

Note: You may see GitHub auth errors in dry-run mode locally - this is normal and won't affect actual releases.

## Environment Setup

Before releasing, ensure:
- You're logged in to npm: `npm login`
- You have push access to the repository
- Your git remote uses SSH (recommended) or you have GitHub token set

See `RELEASING.md` for complete documentation.

