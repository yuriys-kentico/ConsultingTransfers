export type FieldType = 'upload_file' | 'write_text' | 'download_asset';

interface Asset {
  name: string;
  description: string | null;
  type: string;
  size: number;
  url: string;
}

export interface IField {
  name: string;
  codename: string;
  comment: string;
  type: FieldType;
  completed: boolean;
  assets?: Asset[];
  defaultText?: string;
}
