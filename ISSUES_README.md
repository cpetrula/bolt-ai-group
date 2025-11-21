# GitHub Issues Creation Guide

This directory contains scripts to automatically create a comprehensive set of GitHub Issues for the Bolt AI Salon Assistant project based on the README.md specification.

## Overview

The scripts will create:
- **13 Epic Issues** covering all major components:
  1. Backend Infrastructure Setup
  2. Authentication & 2FA System
  3. Multi-Tenant Management
  4. Employee & Service Management
  5. Appointments & Availability System
  6. Billing & Subscriptions (Stripe)
  7. Telephony Integration (Twilio)
  8. AI Assistant Integration
  9. Frontend Application (Vue 3)
  10. Public Website Pages
  11. Admin Dashboard Pages
  12. Reporting & Analytics
  13. Documentation

- **Additional Issues** for:
  - Branding assets (logo, favicon)
  - Demo salon setup
  - Docker compose configuration

Each issue includes:
- Clear title
- Detailed description
- Acceptance criteria
- Required files/directories
- Dependencies on other issues
- Appropriate labels (backend, frontend, ai, telephony, billing, auth, database, docs, enhancement)

## Prerequisites

### Option 1: Python Script (Recommended)

1. **Python 3.6+** installed
2. **PyGithub library**:
   ```bash
   pip install PyGithub
   ```
3. **GitHub Personal Access Token** with **full `repo` scope** (write permissions):
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a name (e.g., "Issue Creator")
   - **Important**: Select the **entire `repo` scope** checkbox (not just sub-items)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
   - Set an appropriate expiration date
   - Click "Generate token" at the bottom
   - **Copy the token immediately** (you won't be able to see it again)
   - The token must have **write permissions** - read-only tokens will fail with 403 errors

### Option 2: Bash Script (Alternative - Creates subset of issues)

> **Note**: The bash script (create-issues.sh) currently creates labels and several initial epic issues. 
> For complete issue creation (**all 16 issues**), use the **Python script (Option 1)** instead.

1. **GitHub CLI (gh)** installed:
   ```bash
   # Install on macOS
   brew install gh
   
   # Install on Linux
   sudo apt install gh  # Ubuntu/Debian
   # or
   sudo dnf install gh  # Fedora
   ```
2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```

## Usage

### Using the Python Script (Recommended)

1. Set your GitHub token as an environment variable:
   ```bash
   export GH_TOKEN=your_github_token_here
   ```

2. Run the script:
   ```bash
   python3 create_github_issues.py
   ```

3. The script will:
   - Create all necessary labels
   - Create all epic and subtask issues
   - Print progress as it works
   - Show a summary at the end

### Using the Bash Script

1. Make sure you're authenticated with `gh`:
   ```bash
   gh auth status
   ```

2. Run the script:
   ```bash
   ./create-issues.sh
   ```

3. The script will:
   - Verify gh CLI is installed and authenticated
   - Create all labels
   - Create all issues one by one
   - Show progress for each issue

## What Gets Created

### Labels

The following labels will be created (if they don't exist):

| Label | Color | Description |
|-------|-------|-------------|
| backend | 0366d6 (blue) | Backend development tasks |
| frontend | fbca04 (yellow) | Frontend development tasks |
| ai | a2eeef (light blue) | AI/ML related tasks |
| telephony | d73a4a (red) | Telephony/Twilio related tasks |
| billing | 0e8a16 (green) | Billing/payment related tasks |
| auth | c5def5 (light blue) | Authentication related tasks |
| database | bfdadc (gray-blue) | Database related tasks |
| docs | d4c5f9 (purple) | Documentation tasks |
| enhancement | 84b6eb (blue) | New feature or request |

### Issue Structure

Each Epic issue includes:
- **Description**: What the epic covers
- **Objectives**: Main goals to achieve
- **Acceptance Criteria**: Checklist of requirements
- **Required Files/Directories**: File structure to create
- **Dependencies**: What must be completed first
- **API Endpoints**: Relevant endpoints (for backend epics)

Each Subtask issue includes:
- **Description**: Specific task description
- **Tasks**: Detailed checklist of work items
- **Acceptance Criteria**: Specific completion requirements
- **Required Files**: Files that need to be created/modified
- **Dependencies**: Links to epic and prerequisite issues

## After Creation

Once the issues are created:

1. **Review the issues** in your GitHub repository
2. **Prioritize** the epics based on your team's capacity
3. **Assign** team members to specific issues
4. **Set milestones** for tracking progress
5. **Use project boards** to organize the work
6. **Link pull requests** to issues as work progresses

## Issue Dependencies

The issues are structured with clear dependencies:

```
Backend Infrastructure Setup (foundational)
  ↓
Authentication & 2FA System
  ↓
Multi-Tenant Management
  ↓
Employee & Service Management
  ↓
Appointments & Availability System
  ↓
Billing & Subscriptions
Telephony Integration
  ↓
AI Assistant Integration
  ↓
Reporting & Analytics

(In parallel)
Frontend Application (Vue 3) (foundational)
  ↓
Public Website Pages
Admin Dashboard Pages

Documentation (ongoing, depends on all epics)
```

## Customization

To modify the issues before creation:

1. **Python script**: Edit the `ISSUES` list in `create_github_issues.py`
2. **Bash script**: Edit the issue definitions in `create-issues.sh`

## Troubleshooting

### Python Script Issues

**Problem**: `ModuleNotFoundError: No module named 'github'`
**Solution**: Install PyGithub: `pip install PyGithub`

**Problem**: `Error: GitHub token not found!`
**Solution**: Set the environment variable: `export GH_TOKEN=your_token`

**Problem**: `Error connecting to GitHub`
**Solution**: Verify your token has `repo` scope and is valid

**Problem**: `DeprecationWarning: Argument login_or_token is deprecated`
**Solution**: This has been fixed in the latest version of the script. Make sure you're using the updated version that uses `Auth.Token()`.

**Problem**: `Request POST /repos/.../labels failed with 403: Forbidden`
**Solution**: Your GitHub token doesn't have write permissions. Make sure to:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with **full `repo` scope** (not just read access)
3. Copy the token and set it: `export GH_TOKEN=your_token`
4. The token must have write permissions to create labels and issues

**Problem**: `Permission denied for label` or `Permission denied creating`
**Solution**: Same as above - ensure your token has write permissions (full `repo` scope)

### Bash Script Issues

**Problem**: `gh: command not found`
**Solution**: Install GitHub CLI from https://cli.github.com/

**Problem**: `You need to authenticate with GitHub CLI`
**Solution**: Run `gh auth login` and follow the prompts

**Problem**: `HTTP 422: Validation Failed`
**Solution**: The issue may already exist, or there's a formatting problem

## Files in This Directory

- `create_github_issues.py` - Python script to create all issues
- `create-issues.sh` - Bash script to create all issues
- `issues-to-create.json` - JSON data structure with issue definitions
- `ISSUES_README.md` - This file

## Support

If you encounter any issues or need modifications to the issue templates, please:
1. Check the troubleshooting section above
2. Review the error messages carefully
3. Ensure your GitHub token/authentication has the correct permissions
4. Verify you have access to the repository

## Notes

- The scripts are idempotent for labels (won't create duplicates)
- Issues will be created fresh each time you run the script
- Already existing issues with the same title will result in duplicates
- Consider deleting test issues before running the final version
- The scripts create issues in the order defined, not necessarily in dependency order

## Next Steps

After creating the issues:

1. **Organize with Projects**: Create a GitHub Project board to track progress
2. **Set Milestones**: Group issues into logical milestones (MVP, Beta, v1.0, etc.)
3. **Refine Estimates**: Add time estimates to issues as needed
4. **Break Down Further**: Some epics may need additional subtask issues
5. **Start Development**: Begin with the foundational epics and work through dependencies

Happy coding! 🚀
