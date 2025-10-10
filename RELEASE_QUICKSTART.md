# 🚀 Release Quickstart

## One Command Release

```bash
pnpm release
```

This automatically:
1. Builds the project
2. Runs tests
3. Analyzes your commits
4. Calculates version bump
5. Updates CHANGELOG.md
6. Updates package.json
7. Commits changes
8. Creates git tag
9. Pushes to GitHub
10. Publishes to npm

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
npx semantic-release --dry-run
```

## Environment Setup

Before releasing, ensure:
- You're logged in to npm: `npm login`
- You have push access to the repository
- Your working directory is clean: `git status`

See `RELEASING.md` for complete documentation.

