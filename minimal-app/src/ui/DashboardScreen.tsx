import React, { useEffect, useMemo, useState } from 'react';
import { ConnectionInfo, DataView } from './types';
import { fetchDashboards, saveDashboard } from '../utils/opensearch';

interface DashboardScreenProps {
  connection: ConnectionInfo;
  dataViews: DataView[];
}

interface DashboardDraft {
  title: string;
  description: string;
  dataViewId: string;
  layout: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ connection, dataViews }) => {
  const [dashboards, setDashboards] = useState<string[]>([]);
  const [draft, setDraft] = useState<DashboardDraft>({
    title: '',
    description: '',
    dataViewId: dataViews[0]?.id ?? '',
    layout: 'grid',
  });
  const [status, setStatus] = useState<string>('');

  const dataViewOptions = useMemo(() => dataViews, [dataViews]);

  useEffect(() => {
    const loadDashboards = async () => {
      try {
        const found = await fetchDashboards(connection);
        setDashboards(found);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Unable to load dashboards');
      }
    };
    loadDashboards();
  }, [connection]);

  const updateDraft = (field: keyof DashboardDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title || !draft.dataViewId) {
      setStatus('Title and data view are required.');
      return;
    }
    try {
      await saveDashboard(connection, draft);
      setStatus('Dashboard saved.');
      const updated = await fetchDashboards(connection);
      setDashboards(updated);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save dashboard');
    }
  };

  return (
    <section className="panel">
      <h1>Dashboards</h1>
      <p className="subtext">
        This minimal authoring view saves dashboards into OpenSearch Dashboards saved objects.
      </p>
      {status && <div className="status-banner">{status}</div>}
      <div className="grid two">
        <div>
          <h2>Create dashboard</h2>
          <form className="form-grid" onSubmit={handleSave}>
            <label>
              Title
              <input
                type="text"
                value={draft.title}
                onChange={(event) => updateDraft('title', event.target.value)}
                placeholder="Executive overview"
              />
            </label>
            <label>
              Description
              <textarea
                value={draft.description}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
            </label>
            <label>
              Data view
              <select
                value={draft.dataViewId}
                onChange={(event) => updateDraft('dataViewId', event.target.value)}
              >
                {dataViewOptions.map((view) => (
                  <option key={view.id} value={view.id}>
                    {view.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Layout preset
              <select
                value={draft.layout}
                onChange={(event) => updateDraft('layout', event.target.value)}
              >
                <option value="grid">Grid</option>
                <option value="freeform">Freeform</option>
              </select>
            </label>
            <button className="primary" type="submit">
              Save dashboard
            </button>
          </form>
        </div>
        <div>
          <h2>Existing dashboards</h2>
          <ul className="list">
            {dashboards.map((title) => (
              <li key={title}>{title}</li>
            ))}
            {dashboards.length === 0 && <li>No dashboards found.</li>}
          </ul>
          <p className="note">
            Editing the full dashboard layout happens in the full OpenSearch Dashboards UI. This
            minimal view focuses on data view selection and basic metadata until a full embeddable
            authoring surface is integrated.
          </p>
        </div>
      </div>
    </section>
  );
};
