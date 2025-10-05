# Claude Desktop MCP Setup Guide

## Quick Setup for Immich MCP Server

### 📋 Prerequisites
- ✅ Node.js installed
- ✅ Project built (`npm run build` completed)
- ✅ Claude Desktop installed

### 🔧 Configuration Steps

#### 1. Find Claude Desktop Config File

**macOS** (your system):
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Quick way to open**:
```bash
open ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### 2. Add MCP Server Configuration

**If file doesn't exist, create it with:**
```json
{
  "mcpServers": {
    "immich": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/Users/andreas/Herd/ImmichMcpServer",
      "env": {
        "IMMICH_API_KEY": "mW4yJAPw92hhNlSI4cJcTeSK3aaZTNAP5qhgT0yJsg",
        "IMMICH_INSTANCE_URL": "https://photos.spoons.dk"
      }
    }
  }
}
```

**If file exists, add to existing mcpServers:**
```json
{
  "mcpServers": {
    "immich": {
      "command": "npm",
      "args": ["start"], 
      "cwd": "/Users/andreas/Herd/ImmichMcpServer",
      "env": {
        "IMMICH_API_KEY": "mW4yJAPw92hhNlSI4cJcTeSK3aaZTNAP5qhgT0yJsg",
        "IMMICH_INSTANCE_URL": "https://photos.spoons.dk"
      }
    }
  }
}
```

#### 3. Restart Claude Desktop
1. **Quit** Claude Desktop (Cmd+Q)
2. **Relaunch** Claude Desktop
3. Wait for MCP connection indicators

### 🧪 Test Commands

Try these in Claude Desktop to test the integration:

```
List my Immich albums
```

```
Show me my Immich server information
```

```
Search for photos containing "sunset"
```

```
Get random photos from my library
```

```
Show me available MCP tools for Immich
```

### 🔍 Available Tools

Once connected, you'll have access to 31 MCP tools:

**Albums (7 tools):**
- albums_list, albums_create, albums_get, albums_update, albums_delete, albums_add_assets, albums_remove_assets

**Assets (7 tools):**
- assets_list, assets_get, assets_update, assets_delete, assets_bulk_update, assets_get_statistics, assets_get_random

**Search (4 tools):**
- search_general, search_smart, search_metadata, search_explore

**Users (4 tools):**
- users_get_me, users_get, users_list, users_update

**Server (6 tools):**
- server_info, server_version, server_stats, server_ping, server_config, server_features

**Schema (3 tools):**
- schema_openapi, schema_tools_list, schema_tool_info

### 🚨 Troubleshooting

**Problem: Claude Desktop doesn't show MCP connection**

1. **Validate JSON syntax**:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
   ```

2. **Test server manually**:
   ```bash
   cd /Users/andreas/Herd/ImmichMcpServer
   npm start
   # Should show: "Immich MCP Server started successfully"
   ```

3. **Check file permissions**:
   ```bash
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

4. **Alternative config (using .env file)**:
   ```json
   {
     "mcpServers": {
       "immich": {
         "command": "npm",
         "args": ["start"],
         "cwd": "/Users/andreas/Herd/ImmichMcpServer"
       }
     }
   }
   ```

**Problem: Server starts but tools don't work**

1. Check your Immich API key is valid
2. Verify Immich instance URL is accessible
3. Test API connection:
   ```bash
   curl -H "X-API-Key: mW4yJAPw92hhNlSI4cJcTeSK3aaZTNAP5qhgT0yJsg" https://photos.spoons.dk/api/users/me
   ```

### 📝 Configuration Template

Save this as a template for easy copying:

```json
{
  "mcpServers": {
    "immich": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/Users/andreas/Herd/ImmichMcpServer",
      "env": {
        "IMMICH_API_KEY": "mW4yJAPw92hhNlSI4cJcTeSK3aaZTNAP5qhgT0yJsg",
        "IMMICH_INSTANCE_URL": "https://photos.spoons.dk"
      }
    }
  }
}
```

### 🎯 Success Indicators

You'll know it's working when:
- ✅ Claude Desktop shows MCP server connected
- ✅ You can ask "What Immich tools are available?"
- ✅ Commands like "List my albums" return actual data
- ✅ No error messages in Claude Desktop