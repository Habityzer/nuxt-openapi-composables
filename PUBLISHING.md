# Publishing Guide: @habityzer/nuxt-openapi-composables

## Prerequisites

Before publishing to npm, ensure you have:

1. ✅ **npm Account** - Create one at https://www.npmjs.com/signup
2. ✅ **GitHub Repository** - For source code hosting
3. ✅ **Package Built** - `pnpm build` completed successfully
4. ✅ **Tests Passing** - `pnpm test` shows all tests passing
5. ✅ **Clean Git State** - All changes committed

## Publishing Steps

### 1. Create GitHub Repository

```bash
# Navigate to package directory
cd /Users/vaz/Sites/habityzer/nuxt-openapi-composables

# Initialize git (already done)
git add -A
git commit -m "chore: prepare for npm publish"

# Create GitHub repo (using gh CLI)
gh repo create nuxt-openapi-composables --public --source=. --remote=origin

# Or manually:
# 1. Go to https://github.com/new
# 2. Create repository named: nuxt-openapi-composables
# 3. Then run:
git remote add origin https://github.com/Habityzer/nuxt-openapi-composables.git
git branch -M main
git push -u origin main
```

### 2. Verify Package is Ready

```bash
# Clean build
rm -rf dist
pnpm build

# Run all tests
pnpm test

# Check what will be published
npm pack --dry-run
```

### 3. Login to npm

```bash
npm login
# Enter your npm credentials:
# - Username
# - Password
# - Email
# - One-time password (if 2FA enabled)
```

### 4. Publish to npm

```bash
# First publish (version 0.1.0)
npm publish

# If you want to publish as a scoped package:
# npm publish --access public
```

### 5. Verify Publication

```bash
# Check on npm
open https://www.npmjs.com/package/@habityzer/nuxt-openapi-composables

# Try installing in a test project
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install @habityzer/nuxt-openapi-composables
npx nuxt-openapi-composables --help
```

## Future Updates

### Patch Release (Bug Fixes)

```bash
# Update version
npm version patch  # 0.1.0 -> 0.1.1

# Push changes
git push --follow-tags

# Publish
npm publish
```

### Minor Release (New Features)

```bash
# Update version
npm version minor  # 0.1.0 -> 0.2.0

# Push changes
git push --follow-tags

# Publish
npm publish
```

### Major Release (Breaking Changes)

```bash
# Update version
npm version major  # 0.1.0 -> 1.0.0

# Push changes
git push --follow-tags

# Publish
npm publish
```

## Update Habityzer to Use Published Package

Once published:

```bash
cd /Users/vaz/Sites/habityzer/habityzer-nuxt

# Remove local version
pnpm remove @habityzer/nuxt-openapi-composables

# Install from npm
pnpm add -D @habityzer/nuxt-openapi-composables

# Test it works
pnpm generate:api
```

## Automated Publishing with GitHub Actions (Optional)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then publish by creating a git tag:

```bash
git tag v0.1.0
git push --tags
```

## Troubleshooting

### Package Name Already Exists

If `@habityzer/nuxt-openapi-composables` is taken, try:
- `@habityzer/nuxt-openapi-generator`
- `@habityzer/nuxt-api-composables`
- Or use a different organization scope

Update in `package.json`:
```json
{
  "name": "@habityzer/nuxt-openapi-composables"
}
```

Then publish with:
```bash
npm publish --access public
```

### Two-Factor Authentication

If you have 2FA enabled on npm:
```bash
npm publish --otp=123456
# Replace 123456 with your 2FA code
```

### Package Build Issues

```bash
# Clean everything and rebuild
rm -rf dist node_modules
pnpm install
pnpm build
```

### Test Before Publishing

```bash
# Create a tarball
npm pack

# This creates habityzer-nuxt-openapi-composables-0.1.0.tgz
# Install it in another project to test:
cd /path/to/test-project
npm install /path/to/habityzer-nuxt-openapi-composables-0.1.0.tgz
```

## Checklist Before Publishing

- [ ] All tests pass (`pnpm test`)
- [ ] Package builds successfully (`pnpm build`)
- [ ] README.md is complete and accurate
- [ ] CHANGELOG.md is updated
- [ ] Version number is correct in package.json
- [ ] Git repository is clean (all changes committed)
- [ ] GitHub repository created and pushed
- [ ] npm account is set up and logged in
- [ ] Package name is available on npm

## After Publishing

1. **Add GitHub Topics:**
   - Go to your GitHub repo
   - Add topics: `nuxt`, `nuxt3`, `openapi`, `typescript`, `code-generation`

2. **Add npm Badge to README:**
   ```markdown
   [![npm version](https://img.shields.io/npm/v/@habityzer/nuxt-openapi-composables.svg)](https://www.npmjs.com/package/@habityzer/nuxt-openapi-composables)
   [![npm downloads](https://img.shields.io/npm/dm/@habityzer/nuxt-openapi-composables.svg)](https://www.npmjs.com/package/@habityzer/nuxt-openapi-composables)
   ```

3. **Announce:**
   - Share on Twitter/X
   - Post in Nuxt Discord
   - Share on Reddit r/Nuxt
   - Consider posting on Dev.to or Hashnode

4. **Monitor:**
   - Check npm download stats
   - Watch GitHub for issues
   - Respond to questions

## Support & Maintenance

- Watch GitHub repo for issues and PRs
- Keep dependencies updated
- Follow semantic versioning
- Write clear commit messages
- Tag releases properly

Good luck with your first npm package! 🚀

