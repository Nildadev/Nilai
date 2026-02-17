import type { ModelInfo } from '~/lib/modules/llm/types';

export type ProviderInfo = {
  staticModels: ModelInfo[];
  name: string;
  getDynamicModels?: (
    providerName: string,
    apiKeys?: Record<string, string>,
    providerSettings?: IProviderSetting,
    serverEnv?: Record<string, string>,
  ) => Promise<ModelInfo[]>;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
  icon?: string;
};

export interface OpenAILikeConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  enabled: boolean;
}

export interface IProviderSetting {
  enabled?: boolean;
  baseUrl?: string;
  openAILikeConfigs?: OpenAILikeConfig[];
}

export type IProviderConfig = ProviderInfo & {
  settings: IProviderSetting;
};
