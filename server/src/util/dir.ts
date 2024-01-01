import Elysia from 'elysia';
import { fileURLToPath } from 'url';
const baseDir = fileURLToPath(import.meta.url).replace('/src/util/dir.ts', '');

export { baseDir };

export function getWebPath(req: any, app: Elysia): string {
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const url = `${protocol}://${req.headers.get('host')}`;
    return url;
}