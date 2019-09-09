import appSettings from '../appSettings.json';
import { createContext } from 'react';

export const AppContext = createContext(appSettings);
