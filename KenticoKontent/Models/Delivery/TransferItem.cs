using System.Collections.Generic;
using System.Text.RegularExpressions;

using Kentico.Kontent.Delivery;

using Newtonsoft.Json;

namespace KenticoKontent.Models.Delivery
{
    public class TransferItem
    {
        public const string Codename = "transfer";

        public ContentItemSystemAttributes System { get; set; }

        public string Info { get; set; }

        public string Fields { get; set; }

        public Info GetInfo()
        {
            return JsonConvert.DeserializeObject<Info>(Info);
        }

        public IEnumerable<ResolvedField> GetFields()
        {
            var fieldsJson = $@"[{Regex
                .Replace(Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{")}]";

            return JsonConvert.DeserializeObject<IEnumerable<ResolvedField>>(fieldsJson);
        }
    }
}