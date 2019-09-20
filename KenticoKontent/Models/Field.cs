using System.Collections.Generic;
using System.Dynamic;
using System.Linq;

using KenticoCloud.Delivery;
using KenticoCloud.Delivery.InlineContentItems;

using Newtonsoft.Json;

namespace KenticoKontent.Models
{
    public class Field : IInlineContentItemsResolver<Field>
    {
        public const string Upload_file = "upload_file";
        public const string Write_text = "write_text";
        public const string Download_asset = "download_asset";

        public const string FieldDetailsNameCodename = "field_details__name";
        public const string FieldDetailsCommentCodename = "field_details__comment";
        public const string FieldDetailsCompletedCodename = "field_details__completed";

        public ContentItemSystemAttributes System { get; set; }

        public string FieldDetailsName { get; set; }

        public string FieldDetailsComment { get; set; }

        public IEnumerable<MultipleChoiceOption> FieldDetailsCompleted { get; set; }

        public IEnumerable<Asset> Assets { get; set; }

        public string DefaultText { get; set; }

        public string Resolve(Field field)
        {
            dynamic fieldObject = new ExpandoObject();

            fieldObject.name = field.FieldDetailsName;
            fieldObject.comment = field.FieldDetailsComment;
            fieldObject.type = field.System.Type;
            fieldObject.completed = field.FieldDetailsCompleted.FirstOrDefault()?.Codename == "true";

            switch (field.System.Type)
            {
                case Download_asset:
                    fieldObject.assets = field.Assets;
                    break;

                case Write_text:
                    fieldObject.defaultText = field.DefaultText;
                    break;
            }

            return JsonConvert.SerializeObject(fieldObject);
        }
    }
}