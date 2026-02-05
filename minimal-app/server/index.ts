import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agent } from 'https';

const app = express();
const port = Number(process.env.PORT || 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use('/api', async (req, res) => {
  const target = req.header('x-opensearch-url');
  if (!target) {
    res.status(400).send('Missing x-opensearch-url header');
    return;
  }

  const url = new URL(target);
  url.pathname = req.originalUrl.replace('/api', '');

  const headers: Record<string, string> = {};
  const authHeader = req.header('authorization');
  if (authHeader) {
    headers['authorization'] = authHeader;
  }
  if (req.header('content-type')) {
    headers['content-type'] = req.header('content-type') as string;
  }

  try {
    const fetchOptions: any = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    };

    if (url.protocol === 'https:') {
      fetchOptions.agent = new Agent({ rejectUnauthorized: false });
    }

    const response = await fetch(url.toString(), fetchOptions);

    const responseText = await response.text();
    res.status(response.status).send(responseText);
  } catch (error) {
    res.status(500).send(error instanceof Error ? error.message : 'Proxy error');
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Proxy server listening on ${port}`);
});
