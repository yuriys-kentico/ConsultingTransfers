import { IField } from './IField';

export interface IFile {
  name: string;
  path: string;
  sizeBytes: number;
  modified: Date;
  field: IField;
}
