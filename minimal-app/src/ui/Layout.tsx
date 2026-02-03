import React from 'react';
import { Screen } from './types';

interface AppLayoutProps {
  embedded: boolean;
  currentScreen: Screen;
  children: React.ReactNode;
}

const SCREEN_LABELS: Record<Screen, string> = {
  connect: 'Connect',
  indices: 'Indices',
  dashboards: 'Dashboards',
};

export const AppLayout: React.FC<AppLayoutProps> = ({ embedded, currentScreen, children }) => {
  return (
    <div className={embedded ? 'app-shell embedded' : 'app-shell'}>
      <header className="header">
        <div>
          <span className="logo">OpenSearch Dashboards Minimal</span>
          <span className="pill">{SCREEN_LABELS[currentScreen]}</span>
        </div>
        {!embedded && (
          <span className="subtext">
            Minimal fork focused on dashboards authoring and index discovery.
          </span>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
};
