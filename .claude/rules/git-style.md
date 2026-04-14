# Git Commit Style

Conventional Commits. Format: `<type>(<scope>): <description>`

## Types

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change (not fix, not feature) |
| `chore` | Maintenance (deps, config, build) |
| `docs` | Documentation only |
| `style` | Formatting, whitespace |
| `perf` | Performance improvement |
| `test` | Adding/fixing tests |
| `content` | Content changes (blog, copy) |

## Scope

Optional. Area affected: `auth`, `payments`, `ui`, `api`, `referral`, `seo`, `web`, `shared`.

## Rules

1. Lowercase everything
2. No period at the end
3. Imperative mood ("add" not "added")
4. First line under 72 chars
5. Scope optional but helps changelogs
