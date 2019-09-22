using System.Text.RegularExpressions;

using KenticoCloud.Delivery;

using Newtonsoft.Json;

namespace KenticoKontent.Models
{
    public class RequestItem
    {
        public string AccountName { get; set; }

        public string Requester { get; set; }

        public string ContainerToken { get; set; }

        public string Fields { get; set; }

        public ContentItemSystemAttributes System { get; set; }

        public RequestItem(Request request, string containerToken)
        {
            dynamic details = JsonConvert.DeserializeObject(request.Details);

            AccountName = details.crmAccountName;
            Requester = details.requester;
            ContainerToken = containerToken;

            Fields = Regex
                .Replace(request.Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{");

            System = request.System;
        }
    }
}