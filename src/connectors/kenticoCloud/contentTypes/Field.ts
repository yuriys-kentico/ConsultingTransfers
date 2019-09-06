import { ContentItem, Elements } from 'kentico-cloud-delivery';

export class Field extends ContentItem {
  public static codename = 'field';
  public name!: Elements.TextElement;
  public comment!: Elements.TextElement;
  public type!: Elements.MultipleChoiceElement;
  public completed!: Elements.MultipleChoiceElement;

  constructor() {
    super({
      richTextResolver: (item: Field) => {
        const field = {
          field: item,
          type: item.type.value[0].codename,
          completed: item.completed.value.length > 0 ? item.completed.value[0].codename : false
        };

        return JSON.stringify(field);
      }
    });
  }
}
