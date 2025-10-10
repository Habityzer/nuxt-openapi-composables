# Release Checklist

## Before You Release

- [ ] All tests pass: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] You're logged in to npm: `npm whoami`
- [ ] You have commit access to the repository
- [ ] All your changes are committed with conventional commit messages

## Release Command

```bash
pnpm release
```

## What Happens Automatically

1. ✅ Analyzes your commits since the last release
2. ✅ Determines the next version (patch/minor/major)
3. ✅ Updates `package.json` with new version
4. ✅ Generates/updates `CHANGELOG.md`
5. ✅ Commits the changes with `chore(release): X.X.X`
6. ✅ Creates a git tag `vX.X.X`
7. ✅ Pushes commits and tags to GitHub
8. ✅ Publishes to npm
9. ✅ Creates a GitHub release with notes

## Commit Message Format

| Type | Triggers | Example |
|------|----------|---------|
| `fix:` | Patch release | `fix: resolve import issue` |
| `feat:` | Minor release | `feat: add new feature` |
| `feat!:` or `BREAKING CHANGE:` | Major release | `feat!: redesign API` |
| `docs:`, `chore:`, `test:` | No release | `docs: update README` |

## If Something Goes Wrong

1. Check npm login: `npm whoami`
2. Check git status: `git status`
3. Check commit history: `git log --oneline`
4. Check if previous release exists: `git tag`

## Manual Rollback (if needed)

```bash
# Revert the release commit
git reset --hard HEAD~1

# Delete the tag locally
git tag -d vX.X.X

# Delete the tag remotely (if pushed)
git push origin :refs/tags/vX.X.X

# Unpublish from npm (only if within 72 hours)
npm unpublish nuxt-openapi-composables@X.X.X
```

