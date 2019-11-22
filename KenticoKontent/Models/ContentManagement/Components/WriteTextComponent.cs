using KenticoKontent.Models.ContentManagement.Elements;

namespace KenticoKontent.Models.ContentManagement.Components
{
    public class WriteTextComponent : AbstractComponent
    {
        public WriteTextComponent(ResolvedField field) : base(field)
        {
            Elements = new AbstractElement[] {
                new TextElement
                {
                    Element = new Reference
                    {
                        Codename = "field_details__name"
                    },
                    Value = field.Name
                },
                new TextElement
                {
                    Element = new Reference
                    {
                        Codename = "field_details__comment"
                    },
                    Value = field.Comment
                },
                new RichTextElement
                {
                    Element = new Reference
                    {
                        Codename = "default_text"
                    },
                    Value = field.DefaultText
                }
            };
        }
    }
}