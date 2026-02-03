import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import './ui/styles.css';

export const mount = (element: HTMLElement) => {
  const root = createRoot(element);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  return () => root.unmount();
};

const container = document.getElementById('root');
if (container) {
  mount(container);
}
