# Immich MCP Server

An OpenAPI 3.0-based MCP (Model Context Protocol) server that provides structured access to Immich 2.0 server functionality through tools, resources, and contextual capabilities.

## Features

- **MCP Protocol Compliance**: Full implementation of MCP server interface
- **Immich 2.0 Integration**: Authenticated access to all major Immich API endpoints
- **Tool-based Architecture**: Each Immich endpoint group exposed as MCP tools
- **OpenAPI 3.0 Schema**: Auto-generated discoverable schemas for all tools
- **Caching Layer**: Optional caching for improved performance
- **Docker Ready**: Production-ready containerization

## Available Tools

### Albums (`albumsTool`)
- `albums_list` - List all albums with filtering options
- `albums_create` - Create new albums with optional assets
- `albums_get` - Get album details by ID
- `albums_update` - Update album name/description
- `albums_delete` - Delete albums
- `albums_add_assets` - Add assets to albums
- `albums_remove_assets` - Remove assets from albums

### Assets (`assetsTool`)
- `assets_list` - List assets with pagination and filtering
- `assets_get` - Get asset details by ID
- `assets_update` - Update asset properties (favorite, archived, etc.)
- `assets_delete` - Delete assets
- `assets_bulk_update` - Bulk update multiple assets
- `assets_get_statistics` - Get asset statistics
- `assets_get_random` - Get random assets

### Search (`searchTool`)
- `search_general` - General search across all entities
- `search_smart` - AI-powered image recognition search
- `search_metadata` - Search by EXIF metadata and location
- `search_explore` - Explore by detected objects/faces/places

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd immich-mcp-server
```

2. Create a `.env` file:
```env
IMMICH_API_KEY=your_immich_api_key_here
IMMICH_INSTANCE_URL=https://your-immich-instance.com
PORT=8000
LOG_LEVEL=info
CACHE_TTL=300
```

3. Build and run with Docker:
```bash
docker build -t immich-mcp-server .
docker run --env-file .env -p 8000:8000 immich-mcp-server
```

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (see above)

3. Run in development mode:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `IMMICH_API_KEY` | Yes | - | Your Immich instance API key |
| `IMMICH_INSTANCE_URL` | Yes | - | Base URL of your Immich instance |
| `PORT` | No | 8000 | Port for the MCP server |
| `LOG_LEVEL` | No | info | Logging level (error, warn, info, debug) |
| `CACHE_TTL` | No | 300 | Cache TTL in seconds for GET requests |

### Getting Immich API Key

1. Log into your Immich web interface
2. Go to Account Settings → API Keys
3. Create a new API key
4. Copy the key to your `.env` file

## Usage with MCP Clients

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "immich": {
      "command": "node",
      "args": ["/path/to/immich-mcp-server/dist/index.js"],
      "env": {
        "IMMICH_API_KEY": "your_api_key",
        "IMMICH_INSTANCE_URL": "https://your-immich-instance.com"
      }
    }
  }
}
```

### Other MCP Clients

Connect to the server using stdio transport on the configured port.

## API Examples

### List Albums
```typescript
// MCP Tool Call
{
  "tool": "albums_list",
  "arguments": {
    "shared": false
  }
}
```

### Search Assets
```typescript
// Smart search for beach photos
{
  "tool": "search_smart", 
  "arguments": {
    "query": "beach sunset",
    "type": "IMAGE",
    "size": 10
  }
}
```

### Update Asset
```typescript
// Mark asset as favorite
{
  "tool": "assets_update",
  "arguments": {
    "assetId": "asset-uuid-here",
    "isFavorite": true
  }
}
```

## Development

### Project Structure

```
src/
├── mcp/           # MCP protocol implementation
├── immich/        # Immich API client & types
├── tools/         # Individual MCP tool definitions
├── schemas/       # Zod schemas for validation
└── utils/         # Logging, config, utilities
```

### Adding New Tools

1. Define schemas in `src/schemas/mcp-schemas.ts`
2. Create tool class in `src/tools/`
3. Register in `src/mcp/server.ts`

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Architecture

The server acts as an intelligent middleware layer:

```
MCP Client → MCP Server → Immich API Proxy → Immich Instance
```

- **MCP Layer**: Handles protocol compliance and tool registration
- **Proxy Layer**: Manages authentication, caching, and error handling
- **Tool Layer**: Converts REST operations to MCP tools with validation

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check `IMMICH_INSTANCE_URL` and API key
2. **Authentication Error**: Verify API key is valid and not expired
3. **Tools Not Available**: Check logs for tool registration errors

### Debugging

Enable debug logging:
```env
LOG_LEVEL=debug
```

Check server logs for detailed request/response information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.