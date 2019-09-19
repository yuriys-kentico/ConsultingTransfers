using System.Text.RegularExpressions;

using KenticoCloud.Delivery;

namespace Functions.Models
{
    public class DetailsValue
    {
        public string AccountName { get; set; }

        public string Requester { get; set; }

        public void Deconstruct(out string accountName, out string requester)
        {
            accountName = AccountName;
            requester = Requester;
        }
    }

    public class RequestItem
    {
        public string AccountName { get; set; }

        public string Requester { get; set; }

        public string ContainerToken { get; set; }

        public string Fields { get; set; }

        public ContentItemSystemAttributes System { get; set; }

        public RequestItem(Request request, string containerToken)
        {
            var (accountName, requester) = AzureFunctionHelper.GetPayload<DetailsValue>(request.Details);

            AccountName = accountName;
            Requester = requester;
            ContainerToken = containerToken;

            Fields = Regex
                .Replace(request.Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{");

            System = request.System;
        }
    }
}