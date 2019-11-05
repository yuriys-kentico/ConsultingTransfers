using System.Collections.Generic;
using System.Text.RegularExpressions;

using Kentico.Kontent.Delivery;

using Newtonsoft.Json;

namespace KenticoKontent.Models.Delivery
{
    public class TemplateItem
    {
        public const string Codename = "template";

        public ContentItemSystemAttributes System { get; set; }

        public string Message { get; set; }

        public string Fields { get; set; }

        public IEnumerable<ResolvedField> GetFields()
        {
            var fieldsJson = $@"[{Regex
                .Replace(Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{")}]";

            return JsonConvert.DeserializeObject<IEnumerable<ResolvedField>>(fieldsJson);
        }
    }
}