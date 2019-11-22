using AzureStorage.Models;

using Core;

using KenticoKontent.Models;

using System.Collections.Generic;
using System.Web;

namespace Transfers.Models
{
    public class Transfer
    {
        public string? Region { get; set; }

        public string? Name { get; set; }

        public string? Codename { get; set; }

        public string? Customer { get; set; }

        public string? Requester { get; set; }

        public string? ContainerUrl { get; set; }

        public string? TransferToken { get; set; }

        public IEnumerable<ResolvedField>? Fields { get; set; }

        public IDictionary<string, File>? Files { get; set; }

        public string? Template { get; set; }

        public static string GetUrl(string? transferToken)
        {
            return $"{CoreHelper.GetSetting("ClientTransferUrl")}{HttpUtility.UrlEncode(transferToken)}";
        }
    }
}