import { fileURLToPath } from 'url';
const baseDir = fileURLToPath(import.meta.url).replace('/src/util/dir.ts', '');

export { baseDir };

export function getWebPath(req: any): string {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const url = `${protocol}://${req.headers['host']}`;
    return url;
}