import { FieldType } from './FieldType';

export interface IField {
  name: string;
  codename: string;
  comment: string;
  type: FieldType;
  completed: boolean;
  assets?: Asset[];
  defaultText?: string;
}

interface Asset {
  name: string;
  description: string | null;
  type: string;
  size: number;
  url: string;
}
