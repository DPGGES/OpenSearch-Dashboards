import React, { useState } from 'react';
import { ConnectionInfo } from './types';

interface ConnectScreenProps {
  connection: ConnectionInfo;
  onConnect: (connection: ConnectionInfo) => Promise<void>;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ connection, onConnect }) => {
  const [formState, setFormState] = useState(connection);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof ConnectionInfo, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onConnect(formState);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h1>Connect to OpenSearch</h1>
      <p className="subtext">
        Provide a URL and credentials. The app will discover indices and prepare data views for
        dashboard authoring.
      </p>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          OpenSearch URL
          <input
            type="url"
            required
            value={formState.url}
            onChange={(event) => updateField('url', event.target.value)}
            placeholder="https://your-opensearch-domain:9200"
          />
        </label>
        <label>
          Authentication
          <select
            value={formState.authType}
            onChange={(event) => updateField('authType', event.target.value)}
          >
            <option value="basic">Basic</option>
            <option value="apiKey">API key</option>
          </select>
        </label>
        {formState.authType === 'basic' ? (
          <>
            <label>
              Username
              <input
                type="text"
                value={formState.username}
                onChange={(event) => updateField('username', event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={formState.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </label>
          </>
        ) : (
          <label>
            API key
            <input
              type="text"
              value={formState.apiKey}
              onChange={(event) => updateField('apiKey', event.target.value)}
            />
          </label>
        )}
        <button className="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </section>
  );
};
