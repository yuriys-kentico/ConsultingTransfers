using System.Text.RegularExpressions;

using KenticoCloud.Delivery;

using Newtonsoft.Json;

namespace KenticoKontent.Models
{
    public class Transfer
    {
        public string Customer { get; set; }

        public string Requester { get; set; }

        public string Region { get; set; }

        public string TransferToken { get; set; }

        public string Fields { get; set; }

        public ContentItemSystemAttributes System { get; set; }

        public Transfer(TransferItem transfer, string transferToken, string region)
        {
            dynamic details = JsonConvert.DeserializeObject(transfer.Details);

            Customer = details.customer;
            Requester = details.requester;
            Region = region;
            TransferToken = transferToken;

            Fields = Regex
                .Replace(transfer.Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{");

            System = transfer.System;
        }
    }
}