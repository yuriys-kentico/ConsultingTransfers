type CustomElement = {
  value: string | null;
  disabled: boolean;
  config: object | null; // Element configuration object specified in the UI in a content type or a content type snippet
};

type Context = {
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
  init: (callback: (element: CustomElement, context: Context) => void) => void;
  setValue: (value: string) => void;
  setHeight: (value: number) => void;
  onDisabledChanged: (callback: (disabled: boolean) => void) => void;
}
