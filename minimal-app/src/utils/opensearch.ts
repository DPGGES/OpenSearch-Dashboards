import { ConnectionInfo, DataView, IndexInfo } from '../ui/types';

const toAuthHeaders = (connection: ConnectionInfo): HeadersInit => {
  if (connection.authType === 'apiKey' && connection.apiKey) {
    return { Authorization: `ApiKey ${connection.apiKey}` };
  }
  if (connection.username || connection.password) {
    const token = btoa(`${connection.username}:${connection.password}`);
    return { Authorization: `Basic ${token}` };
  }
  return {};
};

const request = async (connection: ConnectionInfo, path: string, init?: RequestInit) => {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-opensearch-url': connection.url,
      ...toAuthHeaders(connection),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenSearch request failed (${response.status}): ${errorText || response.statusText}`
    );
  }

  return response;
};

export const fetchIndices = async (connection: ConnectionInfo): Promise<IndexInfo[]> => {
  const response = await request(connection, '/_cat/indices?format=json');
  const data = (await response.json()) as Array<Record<string, string>>;
  return data.map((entry) => ({
    name: entry.index,
    docsCount: Number(entry['docs.count'] ?? 0),
    health: entry.health ?? 'unknown',
    status: entry.status ?? 'unknown',
  }));
};

export const createDataViewsForIndices = (indices: IndexInfo[]): DataView[] => {
  return indices.map((index) => ({
    id: index.name,
    title: index.name,
    indexPattern: index.name,
  }));
};

export const ensureDataViews = async (
  connection: ConnectionInfo,
  dataViews: DataView[]
): Promise<void> => {
  await Promise.all(
    dataViews.map((view) =>
      request(connection, `/.kibana/_doc/index-pattern:${view.id}`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'index-pattern',
          'index-pattern': {
            title: view.title,
            fields: '[]',
            timeFieldName: '',
          },
        }),
      }).catch(() => undefined)
    )
  );
};

export const fetchDashboards = async (connection: ConnectionInfo): Promise<string[]> => {
  const response = await request(connection, '/.kibana/_search', {
    method: 'POST',
    body: JSON.stringify({
      query: {
        term: { type: 'dashboard' },
      },
      size: 100,
    }),
  });
  const payload = (await response.json()) as {
    hits: { hits: Array<{ _source: { dashboard: { title: string } } }> };
  };
  return payload.hits.hits.map((hit) => hit._source.dashboard.title).filter(Boolean);
};

export const saveDashboard = async (
  connection: ConnectionInfo,
  draft: { title: string; description: string; dataViewId: string; layout: string }
) => {
  const now = new Date().toISOString();
  const response = await request(connection, '/.kibana/_doc/dashboard:' + crypto.randomUUID(), {
    method: 'POST',
    body: JSON.stringify({
      type: 'dashboard',
      dashboard: {
        title: draft.title,
        description: draft.description,
        panelsJSON: '[]',
        optionsJSON: JSON.stringify({ useMargins: true, syncColors: true }),
        version: 1,
      },
      references: [
        {
          id: draft.dataViewId,
          name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
          type: 'index-pattern',
        },
      ],
      updated_at: now,
    }),
  });
  return response.json();
};
