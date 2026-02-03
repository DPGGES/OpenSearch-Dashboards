import React from 'react';
import { DataView, IndexInfo } from './types';

interface IndicesScreenProps {
  indices: IndexInfo[];
  dataViews: DataView[];
  onRefresh: () => Promise<void>;
  onContinue: () => void;
}

export const IndicesScreen: React.FC<IndicesScreenProps> = ({
  indices,
  dataViews,
  onRefresh,
  onContinue,
}) => {
  return (
    <section className="panel">
      <h1>Indices & Data Views</h1>
      <p className="subtext">
        We auto-create a data view per index so dashboards can be authored immediately.
      </p>
      <div className="toolbar">
        <button className="secondary" type="button" onClick={onRefresh}>
          Refresh indices
        </button>
        <button className="primary" type="button" onClick={onContinue}>
          Go to dashboards
        </button>
      </div>
      <div className="grid two">
        <div>
          <h2>Indices</h2>
          <ul className="list">
            {indices.map((index) => (
              <li key={index.name}>
                <strong>{index.name}</strong>
                <span>{index.docsCount.toLocaleString()} docs</span>
                <span>{index.health}</span>
                <span>{index.status}</span>
              </li>
            ))}
            {indices.length === 0 && <li>No indices discovered.</li>}
          </ul>
        </div>
        <div>
          <h2>Data views</h2>
          <ul className="list">
            {dataViews.map((view) => (
              <li key={view.id}>
                <strong>{view.title}</strong>
                <span>{view.indexPattern}</span>
              </li>
            ))}
            {dataViews.length === 0 && <li>No data views prepared.</li>}
          </ul>
        </div>
      </div>
    </section>
  );
};
