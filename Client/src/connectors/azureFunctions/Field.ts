export type FieldType = 'upload_file' | 'write_text';

export interface IField {
  name: string;
  comment: string;
  system: {
    name: string;
    codename: string;
    type: string;
  };
}
