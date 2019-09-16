using KenticoCloud.Delivery;

namespace Functions.Models
{
    public partial class Request
    {
        public const string Codename = "request";
        public const string FieldsCodename = "fields";
        public const string DetailsCodename = "details";

        public string Details { get; set; }

        public string Fields { get; set; }

        public ContentItemSystemAttributes System { get; set; }
    }
}