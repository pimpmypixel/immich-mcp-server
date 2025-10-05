# Git Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `immich-mcp-server`
5. Description: "MCP Server for Immich 2.0 API integration with AI agents"
6. Make it **Public** (recommended for open source)
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 2: Remote URL Already Set

The remote URL is already configured for your GitHub username:

```bash
# Already configured:
# git remote set-url origin https://github.com/pimpmypixel/immich-mcp-server.git
```

## Step 3: Push to GitHub

```bash
# Push the main branch and set upstream
git push -u origin main
```

## Alternative: Use GitHub CLI (if installed)

If you have GitHub CLI installed, you can create and push in one step:

```bash
# Create repository and push
gh repo create immich-mcp-server --public --source=. --remote=origin --push
```

## Repository Information

- **Project**: Immich MCP Server
- **Type**: OpenAPI 3.0-based MCP server
- **Features**: 31 MCP tools, Docker support, TypeScript
- **License**: MIT (recommended)
- **Topics**: mcp, immich, openapi, photo-management, ai-agent, typescript, docker

## After Push Success

Your repository will be available at:
`https://github.com/pimpmypixel/immich-mcp-server`

You can then:
1. Add repository topics/tags on GitHub
2. Update repository description
3. Add a license if desired
4. Enable GitHub Actions (already configured in `.github/workflows/`)
5. Set up branch protection rules if needed