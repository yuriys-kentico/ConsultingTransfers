import { ContentItem, Elements } from 'kentico-cloud-delivery';
import { Field } from './Field';

export class ConsultingRequest extends ContentItem {
  public url!: Elements.UrlSlugElement;
  public custom_url!: Elements.TextElement;
  public account_name!: Elements.TextElement;
  public fields!: Elements.LinkedItemsElement<Field>;
}
