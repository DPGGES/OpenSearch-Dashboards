# OpenSearch Dashboards Minimal

A highly simplified fork of OpenSearch Dashboards focused on the core dashboard authoring experience. It provides:

- **Connect screen** to supply OpenSearch URL and credentials.
- **Indices/Data views screen** to auto-create data views for every index.
- **Dashboards screen** to create basic dashboard metadata and store it in OpenSearch saved objects.

> This project intentionally removes advanced plugins (alerting, observability, maps, dev tools). It is designed to be embeddable as a micro-frontend and run standalone.

## Implementation plan

### MVP (this repo)
- Minimal React UI with three screens (Connect → Indices/Data views → Dashboards).
- Lightweight Node proxy to avoid exposing credentials in the browser and to simplify CORS.
- Auto-discovery of indices via `_cat/indices` and creation of data views in `.kibana`.
- Dashboard metadata creation in `.kibana` saved objects.

### Next iteration
- Embed the full dashboard editor (panels, layout, and visualization authoring) by reusing the OpenSearch Dashboards embeddables package.
- Add data view field discovery using the `/_field_caps` API.
- Use saved objects API compatibility and migrations instead of raw `.kibana` writes.
- Integrate role-based access and secure session management.

## Folder structure

```
minimal-app/
  src/
    ui/               # React screens and layout
    utils/            # OpenSearch API helpers
  server/             # Thin Node proxy
  Dockerfile
  docker-compose.yml
```

## Requirements

- Node.js 20+ (for local development)
- Docker + Docker Compose (for full stack run)

## Run with Docker

```bash
docker compose -f minimal-app/docker-compose.yml up --build
```

- Minimal app: http://localhost:3000
- OpenSearch Dashboards (optional): http://localhost:5601
- OpenSearch: http://localhost:9200

## Local development

```bash
cd minimal-app
npm install
npm run dev
```

- Vite UI: http://localhost:3001
- Proxy server: http://localhost:3000

## Configuration

Environment variables (set in `docker-compose.yml` or shell):

- `VITE_DEFAULT_OPENSEARCH_URL`: Default URL shown on Connect screen.
- `VITE_EMBEDDED`: Set `true` to shrink chrome and reduce padding for embedding.
- `PORT`: Proxy server port (default 3000).

## Embedding as a micro-frontend

The build output exposes a `mount` function for embedding into another host page.

```html
<div id="dashboards-root"></div>
<script type="module">
  import { mount } from 'http://localhost:3000/assets/main.js';

  const root = document.getElementById('dashboards-root');
  const unmount = mount(root);

  // Later, to clean up:
  // unmount();
</script>
```

When embedding, set `VITE_EMBEDDED=true` to reduce global styling and header copy.

## API examples

- List indices:
  `GET /_cat/indices?format=json`
- Create data view:
  `POST /.kibana/_doc/index-pattern:<index>`
- Create dashboard:
  `POST /.kibana/_doc/dashboard:<id>`

## Key decisions & tradeoffs

- **Thin proxy service**: avoids exposing credentials in the browser and handles CORS. This is still a simple pass-through and does not implement auth sessions.
- **Saved objects writes**: MVP writes directly to `.kibana` to keep dependencies low. A full implementation should use the OpenSearch Dashboards saved objects API for migrations and validation.
- **Minimal authoring**: The current dashboard screen focuses on metadata + data view selection. A full dashboard editor should be pulled in as a future iteration.

## Error handling

- Invalid credentials or unreachable URL surface connection errors on the Connect screen.
- Proxy failures and OpenSearch errors are surfaced as banners in the UI.

