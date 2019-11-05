using System.Collections.Generic;
using System.Linq;

using Kentico.Kontent.Delivery;
using Kentico.Kontent.Delivery.InlineContentItems;

using Newtonsoft.Json;

namespace KenticoKontent.Models.Delivery
{
    public class Field : IInlineContentItemsResolver<Field>
    {
        public const string Upload_file = "upload_file";
        public const string Write_text = "write_text";
        public const string Download_asset = "download_asset";

        public ContentItemSystemAttributes System { get; set; }

        public string FieldDetailsName { get; set; }

        public string FieldDetailsComment { get; set; }

        public IEnumerable<MultipleChoiceOption> FieldDetailsStatus { get; set; }

        public IEnumerable<Asset> Assets { get; set; }

        public string DefaultText { get; set; }

        public string Resolve(Field field)
        {
            var resolvedField = new ResolvedField
            {
                Name = field.FieldDetailsName,
                Comment = field.FieldDetailsComment,
                Type = field.System.Type,
                Completed = field.FieldDetailsStatus == null
                    ? false
                    : field.FieldDetailsStatus.Any(option => option.Codename == "completed")
            };

            switch (field.System.Type)
            {
                case Download_asset:
                    resolvedField.Assets = field.Assets;
                    break;

                case Write_text:
                    resolvedField.DefaultText = field.DefaultText;
                    break;
            }

            return JsonConvert.SerializeObject(resolvedField);
        }
    }
}