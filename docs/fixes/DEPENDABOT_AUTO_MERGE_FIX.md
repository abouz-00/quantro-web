# Dependabot Auto-Merge Fix

## Problem Statement

**Issue**: Dependabot PRs in `quantro-web` were passing CI/CD tests but still requiring manual approval for merging, while `quantro-backend` was auto-merging correctly.

## Root Cause Analysis

### quantro-web (Before Fix)

The workflow was using `workflow_run` trigger:

```yaml
on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]
    branches: [main]  # ❌ Problem: Dependabot PRs are NOT on main branch
```

**Issues:**

1. **Branch Mismatch**: The `branches: [main]` filter only triggers for workflows that ran on the `main` branch. Dependabot PRs create feature branches (e.g., `dependabot/npm_and_yarn/...`), so the workflow never triggered.

2. **Workflow Context Loss**: Using `workflow_run` requires complex logic to retrieve PR information:
   - Had to query GitHub API to find PR number from branch name
   - Had to fetch PR author separately
   - Lost direct access to PR event data

3. **Timing Issues**: The workflow only ran after CI completed, but the branch filter prevented it from ever running for Dependabot PRs.

### quantro-backend (Working Correctly)

Used direct `pull_request` trigger:

```yaml
on:
  pull_request:
    types: [opened, synchronize]
```

**Advantages:**

1. **Direct PR Context**: Has full `github.event.pull_request` context available
2. **Proper Branch Handling**: Runs on ANY PR, including Dependabot feature branches
3. **Built-in Wait**: Uses `lewagon/wait-on-check-action` to wait for CI checks to pass before merging
4. **Simpler Logic**: Cleaner code without complex PR lookup

## Solution Applied

Replaced the `quantro-web` workflow to match the working `quantro-backend` pattern:

### Key Changes

1. **Trigger Change**: `workflow_run` → `pull_request`
2. **Removed Branch Filter**: Now works on all PR branches
3. **Added Wait Action**: `lewagon/wait-on-check-action` waits for CI completion
4. **Simplified PR Access**: Uses `github.event.pull_request.html_url` directly
5. **Added Checks Permission**: Added `checks: read` to permissions

### Before vs After

| Aspect | Before (Broken) | After (Fixed) |
| ------ | --------------- | ------------- |
| Trigger | `workflow_run` on `main` | `pull_request` (any branch) |
| PR Context | Manual lookup via GH API | Direct from event |
| CI Wait | Implicit (after completion) | Explicit wait action |
| Permissions | `contents`, `pull-requests` | Added `checks: read` |
| Branch Filter | Only `main` | All branches |

## Expected Behavior After Fix

1. **Patch/Minor Updates**:
   - Dependabot opens PR
   - Auto-merge workflow triggers immediately
   - Waits for all CI checks to pass
   - Auto-merges with squash commit
   - Adds comment: "✅ All CI checks passed. Auto-merging this dependency update."

2. **Major Updates**:
   - Dependabot opens PR
   - Auto-merge workflow triggers
   - Adds labels: `major-update`, `needs-review`
   - Adds comment: "🚨 This is a major version update that requires manual review before merging."
   - Requires manual approval

## Testing the Fix

To verify the fix works:

1. Wait for next Dependabot PR
2. Check GitHub Actions tab for "Auto-approve and merge Dependabot PRs" workflow
3. Workflow should:
   - Trigger on PR open/sync
   - Wait for CI checks
   - Auto-merge if patch/minor update
   - Or label for review if major update

## Additional Notes

### Why workflow_run Was Used Initially

The `workflow_run` pattern is sometimes recommended to:

- Prevent workflow injection attacks (PR from fork can't modify workflow)
- Separate permissions (run workflow with repo permissions after untrusted PR completes)

However, **Dependabot is a trusted GitHub bot**, not a fork contributor, so this extra security isn't needed.

### Repository Settings Required

For auto-merge to work, the repository settings must have:

1. **Branch Protection** (Settings → Branches → main):
   - ✅ Require status checks to pass before merging
   - ✅ Status checks: CI/CD Pipeline (test, security, build)

2. **GitHub Actions Permissions** (Settings → Actions):
3. **Dependabot Permissions**:
   - Auto-merge uses PR write permissions from the workflow

## References

- [GitHub Actions: workflow_run event](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#workflow_run)
- [GitHub Actions: pull_request event](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#pull_request)
- [Dependabot Auto-Merge Guide](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions)
- [wait-on-check-action](https://github.com/lewagon/wait-on-check-action)

## Date

Fixed: October 10, 2025
