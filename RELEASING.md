# Release Guide

This project uses **semantic-release** to automate versioning, changelog generation, and publishing.

## 🚀 Quick Release

Simply run:

```bash
pnpm release
```

That's it! This will:
- ✅ Analyze your commit messages
- ✅ Calculate the next version automatically
- ✅ Update `CHANGELOG.md`
- ✅ Update `package.json` version
- ✅ Create a git tag
- ✅ Commit the changes
- ✅ Publish to npm
- ✅ Create a GitHub release

## 📝 Commit Message Convention

Semantic-release uses **Conventional Commits** to determine version bumps:

### Patch Release (0.1.0 → 0.1.1)
Bug fixes and small changes:
```bash
git commit -m "fix: progressive output for code generation"
git commit -m "perf: improve parsing performance"
git commit -m "docs: update README examples"
```

### Minor Release (0.1.0 → 0.2.0)
New features (non-breaking):
```bash
git commit -m "feat: add support for custom headers"
git commit -m "feat: implement caching mechanism"
```

### Major Release (0.1.0 → 1.0.0)
Breaking changes:
```bash
git commit -m "feat!: change API interface

BREAKING CHANGE: The useApi composable now requires config parameter"
```

Or:
```bash
git commit -m "feat: redesign API structure

BREAKING CHANGE: All composable names have changed from useFooApi to useFoo"
```

## 📋 Commit Types

- `feat:` - New feature (triggers minor release)
- `fix:` - Bug fix (triggers patch release)
- `perf:` - Performance improvement (triggers patch release)
- `docs:` - Documentation only (no release)
- `style:` - Code style changes (no release)
- `refactor:` - Code refactoring (no release)
- `test:` - Adding tests (no release)
- `chore:` - Maintenance tasks (no release)
- `ci:` - CI/CD changes (no release)

## 🔄 Release Workflow

### 1. Make Changes and Commit

Use conventional commit messages:
```bash
# Make your changes
git add .
git commit -m "feat: add progressive output to CLI"
git push origin master
```

### 2. Run Release

```bash
pnpm release
```

### 3. Done!

Semantic-release handles everything automatically.

## 🏷️ Pre-releases (Optional)

For beta/alpha releases:

```bash
git checkout -b beta
git commit -m "feat: experimental feature"
git push origin beta

# Then configure .releaserc.json to support beta branch
```

## 🤖 Automated Releases with GitHub Actions

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - master

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: pnpm/action-setup@v2
        with:
          version: 10

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm release
```

### Setup GitHub Secrets

1. Go to your repo → Settings → Secrets and variables → Actions
2. Add `NPM_TOKEN`:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a new Automation token
   - Add it as `NPM_TOKEN` secret

With this setup, every push to `master` with conventional commits will automatically trigger a release!

## 📖 Examples

### Example 1: Bug Fix Release

```bash
git commit -m "fix: correct path resolution for Windows"
git push origin master
pnpm release
# → Releases version 0.1.1
```

### Example 2: New Feature

```bash
git commit -m "feat: add support for YAML schemas"
git push origin master
pnpm release
# → Releases version 0.2.0
```

### Example 3: Breaking Change

```bash
git commit -m "feat!: redesign configuration API

BREAKING CHANGE: Configuration now uses a different structure.
See migration guide in docs."
git push origin master
pnpm release
# → Releases version 1.0.0
```

### Example 4: Multiple Commits

```bash
git commit -m "fix: resolve import issue"
git commit -m "feat: add new validation"
git commit -m "docs: update examples"
git push origin master
pnpm release
# → Releases version 0.2.0 (minor because of feat)
```

## 🔍 Dry Run (Test Before Release)

Test what would happen without actually releasing:

```bash
npx semantic-release --dry-run
```

## 🛠️ Configuration

The release configuration is in `.releaserc.json`:

```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",      // Analyzes commits
    "@semantic-release/release-notes-generator", // Generates notes
    "@semantic-release/changelog",             // Updates CHANGELOG.md
    "@semantic-release/npm",                   // Publishes to npm
    "@semantic-release/git",                   // Commits changes
    "@semantic-release/github"                 // Creates GitHub release
  ]
}
```

## 💡 Tips

- **Always use conventional commits** for automatic versioning
- **Push to master** to trigger releases
- **Use `[skip ci]` in commit message** to skip release
- **Check git status** before releasing
- **Ensure clean working directory** before running release

## ⚠️ Troubleshooting

### No release published

This means no commits since last release matched the release pattern:
- Make sure you're using conventional commit format
- Check that commits aren't all `chore:` or `docs:` (these don't trigger releases)
- Use `feat:` or `fix:` for releases

### Authentication error

- Make sure you're logged in to npm: `npm login`
- Or set `NPM_TOKEN` environment variable

### Git errors

- Ensure your working directory is clean
- Make sure you have push access to the repository

