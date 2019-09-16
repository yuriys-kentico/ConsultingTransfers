export type Element = {
  value: string | null;
  disabled: boolean;
  config: object | null; // Element configuration object specified in the UI in a content type or a content type snippet
};

export type Context = {
  projectId: string;
  item: IItem;
  variant: IVariant;
};

interface IItem {
  id: string;
  codename: string;
}

interface IVariant {
  id: string;
  codename: string;
}

export interface ICustomElement {
  init: (callback: (element: Element, context: Context) => void) => void;
  setValue: (value: string) => void;
  setHeight: (value: number) => void;
  onDisabledChanged: (callback: (disabled: boolean) => void) => void;
}
