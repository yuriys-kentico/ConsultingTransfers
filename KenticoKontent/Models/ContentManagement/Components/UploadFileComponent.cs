using KenticoKontent.Models.ContentManagement.Elements;

namespace KenticoKontent.Models.ContentManagement.Components
{
    public class UploadFileComponent : AbstractComponent
    {
        public UploadFileComponent(ResolvedField field) : base(field)
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
                }
            };
        }
    }
}