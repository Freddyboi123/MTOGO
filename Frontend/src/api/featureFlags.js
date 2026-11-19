import { getJson } from './client';

export async function fetchFeatureFlags() {
  const body = await getJson('/features');
  return body?.data ?? {};
}
