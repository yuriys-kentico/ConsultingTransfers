using Core;

using Kentico.Kontent.Delivery;

using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace KenticoKontent.Models.Delivery
{
    public class TemplateItem
    {
        public const string Codename = "template";

        public ContentItemSystemAttributes System { get; set; } = default!;

        public string? Message { get; set; }

        public string? Fields { get; set; }

        public IEnumerable<ResolvedField> GetFields()
        {
            var fieldsJson = $@"[{Regex
                .Replace(Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{")}]";

            return CoreHelper.Deserialize<IEnumerable<ResolvedField>>(fieldsJson);
        }
    }
}