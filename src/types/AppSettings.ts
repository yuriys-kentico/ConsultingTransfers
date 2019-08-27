import { Configuration } from 'msal';
import deepmerge from 'deepmerge';
import appSettings from '../appSettings.json';

export interface IAppSettings {
  authentication: {
    authenticated: boolean;
    config: Configuration;
  };
  azureStorage: {
    accountName: string;
    containerName: string;
    sasToken: string;
  };
  kenticoCloud: {
    projectId: string;
    secureApiKey: string;
  };
  terms: {
    header: string;
  }
}

const getAppSettings = () => {
  const settingsPaths = ['../appSettings.json', '../appSettings.dev.json'];

  const settings: any[] = [];

  settingsPaths.forEach(path => {
    try {
      const setting = require(path);

      settings.push(setting);
    } catch (e) {
      console.log(e);
    }
  });

  return deepmerge.all(settings) as IAppSettings;
};

export const AppSettings: IAppSettings = appSettings !== undefined ? (appSettings as IAppSettings) : getAppSettings();
