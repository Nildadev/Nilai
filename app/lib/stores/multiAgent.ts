import { map } from 'nanostores';

export interface MultiAgentState {
  enabled: boolean;
  model: string;
}

export const multiAgentStore = map<MultiAgentState>({
  enabled: false,
  model: 'claude-3-5-sonnet-latest', // Default review model
});

export function toggleMultiAgent() {
  const current = multiAgentStore.get();
  multiAgentStore.setKey('enabled', !current.enabled);
}

export function setReviewModel(model: string) {
  multiAgentStore.setKey('model', model);
}
