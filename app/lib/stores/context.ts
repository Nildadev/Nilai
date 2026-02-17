import { map } from 'nanostores';

export interface ContextSource {
  id: string;
  type: 'url' | 'file';
  name: string;
  content: string;
  enabled: boolean;
  loading?: boolean;
}

export const contextStore = map<Record<string, ContextSource>>({});

export function addContextSource(source: ContextSource) {
  contextStore.setKey(source.id, source);
}

export function removeContextSource(id: string) {
  const current = contextStore.get();
  const next = { ...current };
  delete next[id];
  contextStore.set(next);
}

export function toggleContextSource(id: string) {
  const source = contextStore.get()[id];

  if (source) {
    contextStore.setKey(id, { ...source, enabled: !source.enabled });
  }
}

export function updateContextSource(id: string, updates: Partial<ContextSource>) {
  const source = contextStore.get()[id];

  if (source) {
    contextStore.setKey(id, { ...source, ...updates });
  }
}
