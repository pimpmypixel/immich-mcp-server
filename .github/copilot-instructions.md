# Copilot Instructions for Immich MCP Server

## Project Architecture

This is an **MCP (Model Context Protocol) Server** that acts as an intelligent middleware layer between Immich 2.0's REST API and AI agents. The server proxies Immich endpoints as typed MCP tools while maintaining OpenAPI 3.0 compatibility.

### Core Components
- **MCP Protocol Layer**: Implements MCP server interface for tool/resource registration
- **Immich API Proxy**: Authenticated REST client for Immich 2.0 endpoints
- **OpenAPI Schema Generator**: Auto-generates discoverable schemas for all MCP tools
- **Tool Mapping Engine**: Converts Immich REST operations to standardized MCP tools

## Environment Configuration

Always configure environment via `.env` file:
```env
IMMICH_API_KEY=<api_key>           # Required: Immich instance API key
IMMICH_INSTANCE_URL=<base_url>     # Required: Immich server base URL  
PORT=8000                          # Optional: MCP server port
LOG_LEVEL=info                     # Optional: Logging verbosity
CACHE_TTL=300                      # Optional: GET request cache duration
```

## MCP Tool Architecture

### Tool Naming Convention
Follow `{entityType}Tool` pattern:
- `albumsTool` → `/api/albums` endpoints
- `assetsTool` → `/api/assets` endpoints  
- `usersTool` → `/api/users` endpoints
- `searchTool` → `/api/search` endpoints
- `facesTool` → `/api/faces` endpoints
- `metadataTool` → `/api/metadata` endpoints

### Tool Schema Structure
Each MCP tool must include:
```typescript
{
  name: string,           // e.g., "listAlbums"
  description: string,    // Human-readable function description
  input_schema: JSONSchema,   // Input parameters validation
  output_schema: JSONSchema   // Expected response structure
}
```

## Authentication Pattern

All Immich API requests must include authentication:
```typescript
headers: {
  'X-API-Key': process.env.IMMICH_API_KEY,
  'Content-Type': 'application/json'
}
```

## Error Handling

Implement unified error layer that maps Immich HTTP errors to MCP-compatible responses:
- 401/403 → Authentication errors
- 404 → Resource not found
- 429 → Rate limiting
- 5xx → Immich server errors

## Development Workflow

### Project Structure (Recommended)
```
src/
  ├── mcp/           # MCP protocol implementation
  ├── immich/        # Immich API client & proxy layer
  ├── tools/         # Individual MCP tool definitions
  ├── schemas/       # OpenAPI & JSON schema definitions
  └── utils/         # Logging, caching, error handling
```

### Key Implementation Notes
- Use **Node.js 20+** with async/await for concurrent request handling
- Implement **modular tool structure** for easy endpoint extension
- Support **dynamic endpoint discovery** from Immich OpenAPI spec
- Include **request/response logging** with configurable verbosity
- Add **optional caching layer** for repeated GET requests

## Docker Containerization

Target minimal Alpine-based container:
- Use `node:20-alpine` base image
- Expose port 8000 for MCP server
- Support production builds with `--production` flag
- Include health checks for container orchestration

## Testing Priorities

Focus on:
1. **MCP protocol compliance** - tool discovery and invocation
2. **Immich API authentication** - valid token handling
3. **OpenAPI schema validation** - Swagger/Redocly compatibility  
4. **Error handling** - graceful Immich API failure responses
5. **Docker deployment** - container build and runtime validation

## External Dependencies

- **Immich 2.0 API**: Primary data source - see [api.immich.app](https://api.immich.app/endpoints)
- **MCP Protocol**: Follow latest MCP specification for tool/resource interfaces
- **OpenAPI 3.0**: Ensure schema generation meets OpenAPI 3.0 standards

## Critical Integration Points

- MCP clients expect **consistent tool schemas** across all endpoints
- Immich API responses must be **transformed to MCP resource format**
- Authentication tokens should be **validated on server startup**
- OpenAPI schemas must be **dynamically generated** from tool definitions