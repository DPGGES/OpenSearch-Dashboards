import React, { useMemo, useState } from 'react';
import { ConnectScreen } from './ConnectScreen';
import { DashboardScreen } from './DashboardScreen';
import { IndicesScreen } from './IndicesScreen';
import { AppLayout } from './Layout';
import { AppState, ConnectionInfo, Screen } from './types';
import { createDataViewsForIndices, ensureDataViews, fetchIndices } from '../utils/opensearch';

const DEFAULT_URL = import.meta.env.VITE_DEFAULT_OPENSEARCH_URL || 'http://localhost:9200';

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    screen: 'connect',
    connection: {
      url: DEFAULT_URL,
      authType: 'basic',
      username: '',
      password: '',
      apiKey: '',
    },
    indices: [],
    dataViews: [],
    errors: [],
  });

  const isEmbedded = useMemo(() => {
    const envToggle = import.meta.env.VITE_EMBEDDED === 'true';
    return envToggle;
  }, []);

  const setScreen = (screen: Screen) => {
    setState((prev) => ({ ...prev, screen }));
  };

  const handleConnect = async (connection: ConnectionInfo) => {
    setState((prev) => ({ ...prev, connection, errors: [] }));
    try {
      const indices = await fetchIndices(connection);
      const dataViews = createDataViewsForIndices(indices);
      await ensureDataViews(connection, dataViews);
      setState((prev) => ({ ...prev, indices, dataViews, screen: 'indices' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, errors: [message] }));
    }
  };

  const handleRefreshIndices = async () => {
    try {
      const indices = await fetchIndices(state.connection);
      const dataViews = createDataViewsForIndices(indices);
      await ensureDataViews(state.connection, dataViews);
      setState((prev) => ({ ...prev, indices, dataViews }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({ ...prev, errors: [message] }));
    }
  };

  const onIndicesContinue = () => {
    setScreen('dashboards');
  };

  return (
    <AppLayout embedded={isEmbedded} currentScreen={state.screen}>
      {state.errors.length > 0 && (
        <div className="error-banner">
          <strong>Connection error:</strong> {state.errors[0]}
        </div>
      )}
      {state.screen === 'connect' && (
        <ConnectScreen connection={state.connection} onConnect={handleConnect} />
      )}
      {state.screen === 'indices' && (
        <IndicesScreen
          indices={state.indices}
          dataViews={state.dataViews}
          onRefresh={handleRefreshIndices}
          onContinue={onIndicesContinue}
        />
      )}
      {state.screen === 'dashboards' && (
        <DashboardScreen connection={state.connection} dataViews={state.dataViews} />
      )}
    </AppLayout>
  );
};
