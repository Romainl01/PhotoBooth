---
description: Finalize a feature (clean, doc, learning, PR)
argument-hint: [branch-name]
allowed-tools:
  - Bash
  - EditTool
  - ReadTool
---

You are in charge of finalizing a feature that has just been developed.

## Steps to follow

### 0. Prerequisites Check
- Verify current directory and project structure
- Check for uncommitted or untracked files (warn if present)
- Verify GitHub CLI installed (`gh --version`) - required for step 5
- Navigate to `nextjs-app/` directory for all npm commands

### 1. Code Cleanup
- **Format code:** `cd nextjs-app && npm run lint -- --fix`
  - Project uses ESLint (no Prettier configured)
- **Remove debug statements:** Search and remove `console.log`, `console.error`, etc.
  - Search: `grep -r "console\." nextjs-app/src/`
  - Manual removal or show locations to user
- **Check imports:** Review unused imports flagged by ESLint
- **Remove dead code:** Check for commented code blocks
- Show a summary of changes before applying

### 2. Build Verification
- **Run production build:** `cd nextjs-app && npm run build`
- Verify build succeeds without errors
- If build fails, stop and address errors before proceeding

### 3. Documentation
- **Update MORPHEO_DOCUMENTATION.md** if:
  - Architecture changes
  - New components or APIs added
  - Feature additions to section 1.2 or 1.3
- **Update README.md** if:
  - Installation steps changed
  - New environment variables required
  - Filter count changed (currently 13)
  - API endpoints modified
  - New dependencies added
- Show the changes made

### 4. Learnings
- Add a new entry to PROJECT_LEARNINGS.md following existing format:
  - Use markdown headers (##, ###)
  - Include code examples in triple backticks
  - Date and feature name
  - Key technical decisions made
  - Challenges encountered and solutions
  - Add to checklist if applicable (see line 207 of PROJECT_LEARNINGS.md)
  - Future improvements to consider
- Ask user to review and complete the entry

### 5. Pull Request
- **Prerequisite:** Check if `gh` CLI is installed
  - If missing: Push to GitHub manually and provide PR creation URL
- **Analyze commits:** Review commits from current branch since diverging from main
  - Use: `git log --oneline main..HEAD` or `git log --oneline [base-branch]..HEAD`
- **Generate PR message** following conventional commit format:
  - **Title formats:**
    - `feat: add [feature]` - New features
    - `fix: resolve [issue]` - Bug fixes
    - `refactor: improve [component]` - Code improvements
    - `docs: update [documentation]` - Documentation only
    - `style: adjust [visual element]` - UI/styling changes
  - **Description:**
    - What was done (bullet points)
    - Notable technical changes
    - Components/files affected
    - Testing performed
  - **IMPORTANT**: NEVER mention Claude, AI, or any automated assistance
- **Create PR:**
  - If `gh` available: `gh pr create --title "..." --body "..."`
  - If not: `git push -u origin [branch-name]` and provide GitHub URL

## Expected behavior
- ✅ Ask for confirmation before each major step
- ✅ Show diffs/changes before applying them
- ✅ Stop if build fails - don't proceed to PR creation
- ✅ Be concise and actionable
- ✅ If a step is not applicable, clearly indicate it and continue
- ✅ All npm commands MUST run from `nextjs-app/` directory

## Project-Specific Notes
- **Monorepo structure:** Git root is `/NanoBananaTutorial/`, Next.js app is in `nextjs-app/`
- **No Prettier:** Only ESLint is configured
- **Lint script:** `npm run lint` (add `-- --fix` for auto-fixing)
- **Build script:** `npm run build`
- **Recent commit pattern:** Mix of conventional commits and natural language - prefer conventional format

## Optional argument
If a branch name is provided ($ARGUMENTS), use it to analyze commits.
Otherwise, use the current branch.