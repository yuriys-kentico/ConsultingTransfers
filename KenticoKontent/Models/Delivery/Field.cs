using Core;

using Kentico.Kontent.Delivery;
using Kentico.Kontent.Delivery.InlineContentItems;

using System.Collections.Generic;

namespace KenticoKontent.Models.Delivery
{
    public class Field : IInlineContentItemsResolver<Field>
    {
        public const string heading = nameof(heading);
        public const string write_text = nameof(write_text);
        public const string upload_file = nameof(upload_file);
        public const string download_asset = nameof(download_asset);

        public ContentItemSystemAttributes System { get; set; } = null!;

        public string? FieldDetailsName { get; set; }

        public string? FieldDetailsComment { get; set; }

        public IEnumerable<MultipleChoiceOption>? FieldDetailsStatus { get; set; }

        public IEnumerable<Asset>? Assets { get; set; }

        public string? DefaultText { get; set; }

        public string? Resolve(Field field)
        {
            var resolvedField = new ResolvedField
            {
                Name = field.FieldDetailsName,
                Codename = field.System.Codename,
                Comment = field.FieldDetailsComment,
                Type = field.System.Type
            };

            switch (field.System.Type)
            {
                case download_asset:
                    resolvedField.Assets = field.Assets;
                    break;

                case write_text:
                    resolvedField.DefaultText = field.DefaultText;
                    break;
            }

            return CoreHelper.Serialize(resolvedField);
        }
    }
}