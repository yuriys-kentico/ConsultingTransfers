using AzureStorage.Models;

using KenticoKontent.Models;

using System.Collections.Generic;

namespace Transfers.Models
{
    public class Transfer
    {
        public string? Region { get; set; }

        public string? Name { get; set; }

        public string? Codename { get; set; }

        public string? Customer { get; set; }

        public string? ContainerUrl { get; set; }

        public string? TransferToken { get; set; }

        public IEnumerable<ResolvedField>? Fields { get; set; }

        public IDictionary<string, File>? Files { get; set; }

        public string? Template { get; set; }
    }
}