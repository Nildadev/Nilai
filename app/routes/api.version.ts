import { json } from '@remix-run/cloudflare';
import packageJson from '../../package.json';

export async function loader() {
  return json({ version: packageJson.version });
}
