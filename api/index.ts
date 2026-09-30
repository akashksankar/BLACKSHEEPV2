import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // If Vercel rewrites stripped '/api', normalize req.url back so it matches the Express routes
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return (app as any)(req, res);
}
