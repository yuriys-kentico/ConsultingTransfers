import { ContentItem, Elements } from 'kentico-cloud-delivery';

export class Request extends ContentItem {
  public static codename = 'request';
  public url!: Elements.UrlSlugElement;
  public account_name!: Elements.TextElement;
  public requester!: Elements.TextElement;
  public fields!: Elements.RichTextElement;
}
