using System;

namespace Functions.Models
{
    public class GetTransferRequest
    {
        public string? TransferToken { private get; set; }

        public bool Files { private get; set; }

        public bool Fields { private get; set; }

        public bool ContainerUrl { private get; set; }

        internal void Deconstruct(
            out string transferToken,
            out bool files,
            out bool fields,
            out bool containerUrl
            )
        {
            transferToken = TransferToken ?? throw new ArgumentNullException(nameof(transferToken));
            files = Files;
            fields = Fields;
            containerUrl = ContainerUrl;
        }
    }
}