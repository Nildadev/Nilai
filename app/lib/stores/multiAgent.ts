import { atom } from 'nanostores';

export const multiAgentStore = atom<boolean>(false);

export function toggleMultiAgent() {
  multiAgentStore.set(!multiAgentStore.get());
}
