import { BaseProvider, getOpenAILikeModel } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';

export default class OpenAILikeProvider extends BaseProvider {
  name = 'OpenAILike';
  getApiKeyLink = undefined;

  config = {
    baseUrlKey: 'OPENAI_LIKE_API_BASE_URL',
    apiTokenKey: 'OPENAI_LIKE_API_KEY',
  };

  staticModels: ModelInfo[] = [];

  async getDynamicModels(
    apiKeys?: Record<string, string>,
    settings?: IProviderSetting,
    serverEnv: Record<string, string> = {},
  ): Promise<ModelInfo[]> {
    const configs = settings?.openAILikeConfigs || [];
    const enabledConfigs = configs.filter((c) => c.enabled);

    if (enabledConfigs.length === 0) {
      // Fallback to default if no multi-configs
      const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
        apiKeys,
        providerSettings: settings,
        serverEnv,
        defaultBaseUrlKey: 'OPENAI_LIKE_API_BASE_URL',
        defaultApiTokenKey: 'OPENAI_LIKE_API_KEY',
      });

      if (!baseUrl || !apiKey) {
        return [];
      }

      try {
        const response = await fetch(`${baseUrl}/models`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        const res = (await response.json()) as any;

        return res.data.map((model: any) => ({
          name: model.id,
          label: `${model.id} (OpenAILike)`,
          provider: this.name,
          maxTokenAllowed: 8000,
        }));
      } catch (e) {
        return [];
      }
    }

    const allModels: ModelInfo[] = [];

    for (const config of enabledConfigs) {
      try {
        const response = await fetch(`${config.baseUrl}/models`, {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        });
        const res = (await response.json()) as any;

        const models = res.data.map((model: any) => ({
          name: `${config.id}:${model.id}`,
          label: `${model.id} (${config.name})`,
          provider: this.name,
          maxTokenAllowed: 8000,
        }));
        allModels.push(...models);
      } catch (e) {
        console.error(`Error fetching models for ${config.name}:`, e);
      }
    }

    return allModels;
  }

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;
    const settings = providerSettings?.[this.name];

    // Check if it's a multi-config model (id:modelId)
    if (model.includes(':')) {
      const [configId, modelId] = model.split(':');
      const config = settings?.openAILikeConfigs?.find((c) => c.id === configId);

      if (config && config.enabled) {
        return getOpenAILikeModel(config.baseUrl, config.apiKey, modelId);
      }
    }

    const { baseUrl, apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: settings,
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'OPENAI_LIKE_API_BASE_URL',
      defaultApiTokenKey: 'OPENAI_LIKE_API_KEY',
    });

    if (!baseUrl || !apiKey) {
      throw new Error(`Missing configuration for ${this.name} provider`);
    }

    return getOpenAILikeModel(baseUrl, apiKey, model);
  }
}
