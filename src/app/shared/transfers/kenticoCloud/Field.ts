import { ContentItem, Elements } from 'kentico-cloud-delivery';

export class Field extends ContentItem {
  public name!: Elements.TextElement;
  public comment!: Elements.TextElement;
  public type!: Elements.MultipleChoiceElement;

  constructor() {
    super({
      richTextResolver: (item: Field) => {
        const field = {
          name: item.name.value,
          comment: item.comment.value,
          type: item.type.value[0].codename
        };

        return JSON.stringify(field);
      }
    });
  }
}
