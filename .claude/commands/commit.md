---
description: Create a git commit with a Conventional Commits message
model: haiku
---

Create a git commit for the current changes, formatting the commit message according to the [Conventional Commits](https://www.conventionalcommits.org/) specification.

Only commit when there are actual staged or unstaged changes to commit — if there's nothing to commit, say so and stop.

## Steps

1. Run in parallel:
   - `git status` (never `-uall`) to see untracked files
   - `git diff HEAD` to see all staged and unstaged changes
   - `git log --oneline -10` to match this repo's recent commit style
2. Draft the commit message:
   - Format: `<type>(<scope>): <description>`
   - `<type>` — one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
   - `<scope>` — optional, lowercase. In this monorepo, prefer the touched package name (`api`, `web-admin`, `web-empleados`, `web-clientes`, `web-shared`) or `docs`/`scripts` when the change is there. Omit the scope if changes span multiple packages with no common theme.
   - `<description>` — imperative mood, lowercase, no trailing period, focused on *why* the change was made, not a restatement of the diff.
   - Add a `BREAKING CHANGE:` footer if the change breaks backward compatibility.
   - Add a body only if the change needs more explanation than the subject line allows.
3. Stage the relevant files by name (never `git add -A`/`git add .`) and create the commit via a HEREDOC, ending with:
   ```
   Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
   ```
4. Run `git status` after committing to confirm success.

## Rules

- Never use `git commit --amend`, `--no-verify`, or `--no-gpg-sign`.
- Never push.
- If a pre-commit hook fails and modifies files, re-stage and create a **new** commit — do not amend.
- If staged changes look unrelated to each other, ask before bundling them into one commit.
- Double-check file contents before staging anything that looks like it could hold secrets (`.env`, credentials, keys), even if the filename looks innocuous.
- Before making the commit, use the tool `AskUserQuestion` to ask the user if the message is Ok.