import { atom } from 'nanostores';

export const webSearchStore = atom<boolean>(false);

export function toggleWebSearch() {
  webSearchStore.set(!webSearchStore.get());
}
