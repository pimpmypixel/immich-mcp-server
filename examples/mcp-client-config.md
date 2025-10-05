# Example MCP Client Configurations

## Claude Desktop

Add the following to your Claude Desktop MCP configuration file:

### Option 1: Using Node.js directly
```json
{
  "mcpServers": {
    "immich": {
      "command": "node",
      "args": ["/path/to/immich-mcp-server/dist/index.js"],
      "env": {
        "IMMICH_API_KEY": "your_immich_api_key_here",
        "IMMICH_INSTANCE_URL": "https://your-immich-instance.com",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Option 2: Using npm start
```json
{
  "mcpServers": {
    "immich": {
      "command": "npm",
      "args": ["start"],
      "cwd": "/path/to/immich-mcp-server",
      "env": {
        "IMMICH_API_KEY": "your_immich_api_key_here",
        "IMMICH_INSTANCE_URL": "https://your-immich-instance.com",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Option 3: Using Docker
```json
{
  "mcpServers": {
    "immich": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--env-file", "/path/to/your/.env",
        "immich-mcp-server:latest"
      ]
    }
  }
}
```

## Other MCP Clients

For other MCP clients that support stdio transport, you can connect to the server using:

- **Command**: `node dist/index.js` (or `npm start`)
- **Working Directory**: Project root directory
- **Environment Variables**: Set `IMMICH_API_KEY`, `IMMICH_INSTANCE_URL`, etc.

## Environment Variables

Make sure to set these environment variables either in your `.env` file or in the MCP client configuration:

```env
IMMICH_API_KEY=your_immich_api_key_here
IMMICH_INSTANCE_URL=https://your-immich-instance.com
PORT=8000
LOG_LEVEL=info
CACHE_TTL=300
```

## Testing the Connection

You can test if the MCP server is working properly by:

1. Starting the server manually: `npm start`
2. Checking the logs for successful Immich API connection
3. Using an MCP client to call `server_ping` tool
4. Verifying tool discovery with `schema_tools_list`

## Troubleshooting

### Common Issues

1. **"Cannot connect to Immich API"**
   - Check your `IMMICH_API_KEY` is valid
   - Verify `IMMICH_INSTANCE_URL` is correct and accessible
   - Ensure Immich server is running

2. **"Module not found" errors**
   - Make sure you ran `npm install` and `npm run build`
   - Check that all dependencies are installed

3. **"MCP server not responding"**
   - Check that the server process is running
   - Verify there are no port conflicts
   - Check the server logs for errors

### Debug Mode

Enable debug logging to see detailed request/response information:

```env
LOG_LEVEL=debug
```

This will show all API calls, responses, and internal server operations.