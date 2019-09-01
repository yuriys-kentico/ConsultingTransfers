import { ContentItem, Elements } from 'kentico-cloud-delivery';

export type FieldType = 'upload_file';

export class Field extends ContentItem {
  public type!: Elements.MultipleChoiceElement;
}
