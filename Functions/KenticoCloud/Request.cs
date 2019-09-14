using KenticoCloud.Delivery;

namespace Functions.KenticoCloud
{
    public partial class Request
    {
        public const string Codename = "request";
        public const string AccountNameCodename = "account_name";
        public const string CustomUrlCodename = "custom_url";
        public const string FieldsCodename = "fields";
        public const string UrlCodename = "url";
        public const string RequesterCodename = "requester";

        public string AccountName { get; set; }

        public string CustomUrl { get; set; }

        public string Fields { get; set; }

        public string Url { get; set; }

        public string Requester { get; set; }

        public ContentItemSystemAttributes System { get; set; }
    }
}