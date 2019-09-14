using System.Collections.Generic;
using System.Linq;

using KenticoCloud.Delivery;
using KenticoCloud.Delivery.InlineContentItems;

using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Functions.KenticoCloud
{
    public class Field : IInlineContentItemsResolver<Field>
    {
        public const string Codename = "field";
        public const string TypeCodename = "type";
        public const string NameCodename = "name";
        public const string CompletedCodename = "completed";
        public const string CommentCodename = "comment";

        public IEnumerable<MultipleChoiceOption> Type { get; set; }

        public string Name { get; set; }

        public IEnumerable<MultipleChoiceOption> Completed { get; set; }

        public string Comment { get; set; }

        public ContentItemSystemAttributes System { get; set; }

        public string Resolve(Field field)
        {
            var fieldObject = new
            {
                field,
                type = field.Type.First().Codename,
                completed = field.Completed.FirstOrDefault()?.Codename == "true"
            };

            return JsonConvert.SerializeObject(fieldObject, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });
        }
    }
}