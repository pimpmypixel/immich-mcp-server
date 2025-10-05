🧭 Product Requirements Document (PRD)
1. Project Title

Immich MCP Server — an OpenAPI 3.0–based MCP server that provides structured access to Immich 2.0 server functionality through tools, resources, and contextual capabilities, running inside a Dockerized environment.

2. Objective

To develop a feature-complete MCP server that acts as an intelligent middleware layer between Immich 2.0’s REST API and AI agents (e.g., Copilot, ChatGPT, or custom MCP clients).

The server will:

- Expose Immich 2.0 endpoints as typed MCP tools and resources.
- Enable secure authenticated requests to Immich instances.
- Support content discovery, image/video management, sharing, and user metadata retrieval.
- Provide developer-friendly OpenAPI 3.0 schema definitions to guide auto-generated code (for GitHub Copilot).

3. Background

Immich is an open-source self-hosted photo and video management platform (similar to Google Photos), supporting local indexing, AI-based tagging, face recognition, and more.
The MCP server should allow agents and developers to access Immich resources programmatically — e.g., retrieve albums, upload media, manage users, query metadata — using MCP tools consistent with the OpenAPI 3.0 specification and Immich 2.0 API conventions.

References:

- [Immich GitHub Repositories](https://github.com/orgs/immich-app/repositories)
- [Community Projects](https://docs.immich.app/community-projects/)
- [Immich API Documentation](https://api.immich.app/endpoints)

4. Target Users
- Regular users who want to add easy Immich media handling and manipulation to Claude desktop and other consumer clients. 
- Developers integrating Immich with automation agents or Copilot extensions.
- Data engineers managing large local photo libraries via automation.
- AI app creators building photo- and video-aware assistants.
- System admins deploying private Immich instances with MCP integration.

5. Functional Requirements

## 5.1 Core Features
| **Feature**                       | **Description**                                                                                            | **Priority** |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------ |
| **Immich API Proxy Layer**        | Proxy REST calls to `/api/` endpoints (e.g., `/albums`, `/assets`, `/users`)                               | Must-have    |
| **Authentication**                | Token-based authentication with configurable API key or user token via environment variable or config file | Must-have    |
| **MCP Tool Exposure**             | Each Immich endpoint group becomes an MCP toolset (e.g., `albumsTool`, `assetsTool`, `usersTool`)          | Must-have    |
| **OpenAPI 3.0 Schema Generation** | Generate a discoverable OpenAPI spec for all Immich-based MCP tools                                        | Must-have    |
| **Dynamic Endpoint Discovery**    | Auto-map Immich REST routes from an imported schema or JSON spec                                           | Should-have  |
| **Resource Types**                | Define resources for media assets, albums, users, and metadata following MCP resource conventions          | Must-have    |
| **Error Handling Layer**          | Unified error codes and messages across Immich endpoints                                                   | Must-have    |
| **Logging and Telemetry**         | Basic request/response logs; optional structured telemetry                                                 | Should-have  |
| **Caching**                       | Optional local caching layer for repeated Immich GET requests                                              | Nice-to-have |

## 5.2 Example MCP Tools
| **Tool Name**  | **Function**                           | **Related Immich Endpoint** |
| -------------- | -------------------------------------- | --------------------------- |
| `albumsTool`   | List, create, update, or delete albums | `/api/albums`               |
| `assetsTool`   | Upload, tag, and delete media files    | `/api/assets`               |
| `usersTool`    | Retrieve or update user info           | `/api/users`                |
| `searchTool`   | Search across albums and assets        | `/api/search`               |
| `facesTool`    | Access facial recognition metadata     | `/api/faces`                |
| `metadataTool` | Retrieve EXIF or AI-generated tags     | `/api/metadata`             |
| `serverTool`   | Query server health and statistics     | `/api/server-info`          |

# 6. Non-Functional Requirements
| **Category**         | **Requirement**                                                                  |
| -------------------- | -------------------------------------------------------------------------------- |
| **Performance**      | Minimal latency proxying between MCP clients and Immich API; caching optional    |
| **Security**         | Use HTTPS; environment variable or `.env` configuration for credentials          |
| **Scalability**      | Should handle concurrent MCP requests (Node.js or Python async model)            |
| **Compatibility**    | Must comply with OpenAPI 3.0 spec and MCP server interface                       |
| **Maintainability**  | Modular code structure for easy extension and endpoint mapping                   |
| **Containerization** | Dockerfile must allow fast build and local deployment with minimal configuration |



# 7. Environment & Deployment
7.1 Dockerfile Specification

A minimal Dockerfile for reproducible builds:

```python
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 8000
CMD ["npm", "start"]
```

7.2 Configuration Options

Environment variables to be supported:

```python
IMMICH_BASE_URL=https://immich.local/api
IMMICH_API_KEY=<your_api_key>
PORT=8000
LOG_LEVEL=info
CACHE_TTL=300
```

# 8. Integration with MCP

The server will:

- Implement the MCP protocol for tool and resource registration.
- Map each Immich REST operation to a standardized MCP Tool (with name, description, input/output schemas).
- Provide resource discovery for Immich entities (e.g., albums, assets, faces).
- Support JSON schema introspection for Copilot or LLM plugin registration.

Example MCP Tool Schema:

```json
{
  "name": "listAlbums",
  "description": "Retrieve all albums from Immich",
  "input_schema": {
    "type": "object",
    "properties": {
      "limit": { "type": "integer", "default": 20 }
    }
  },
  "output_schema": {
    "type": "array",
    "items": { "$ref": "#/components/schemas/Album" }
  }
}
```

9. Future Enhancements

- WebSocket or SSE event streaming for real-time asset updates.
- OAuth2 authentication flow for public-facing integrations.
- GraphQL overlay for richer query semantics.
- Integration with AI tagging or external LLMs for automated media labeling.

10. Deliverables

- ✅ Functional MCP server (Node.js or Python) with Immich API integration.
- ✅ OpenAPI 3.0 schema for all tools and resources.
- ✅ Dockerfile for production-ready container builds.
- ✅ Example .env and usage documentation.
- ✅ GitHub Actions CI/CD workflow for testing and publishing Docker images.

11. Acceptance Criteria

- MCP server runs successfully inside Docker.
- API requests to Immich endpoints proxy correctly with authentication.
- OpenAPI schema generation validated by Swagger or Redocly.
- MCP tool discovery and invocation functional from a Copilot-compatible client.
- Documentation aligns with Immich 2.0 API structure and endpoint behavior.