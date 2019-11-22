using Core;

using Kentico.Kontent.Delivery;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace KenticoKontent.Models.Delivery
{
    public class TransferItem
    {
        public const string Codename = "transfer";

        public ContentItemSystemAttributes System { get; set; } = null!;

        public string? Info { get; set; }

        public string? Fields { get; set; }

        public ResolvedInfo GetInfo()
        {
            Info = Info ?? throw new ArgumentNullException(nameof(Info));

            return CoreHelper.Deserialize<ResolvedInfo>(Info);
        }

        public IEnumerable<ResolvedField> GetFields(IEnumerable<string> completedFields)
        {
            var fieldsJson = $@"[{Regex
                .Replace(Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{")}]";

            var fields = CoreHelper.Deserialize<IEnumerable<ResolvedField>>(fieldsJson);

            foreach (var field in fields)
            {
                field.Completed = completedFields == null
                    ? false
                    : completedFields.Any(fieldName => field.Codename == fieldName);
            }

            return fields;
        }
    }
}