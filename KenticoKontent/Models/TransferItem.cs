using KenticoCloud.Delivery;

namespace KenticoKontent.Models
{
    public partial class TransferItem
    {
        public const string Codename = "transfer";
        public const string DetailsCodename = "details";
        public const string FieldsCodename = "fields";

        public string Details { get; set; }

        public string Fields { get; set; }

        public ContentItemSystemAttributes System { get; set; }
    }
}