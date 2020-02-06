using Authorization.Models;

using System;

namespace Transfers.Models
{
    public class GetTransferParameters
    {
        public string? TransferToken { private get; set; }

        public bool Files { private get; set; }

        public bool Fields { private get; set; }

        public bool ContainerUrl { private get; set; }

        public IAccessTokenResult? AccessTokenResult { private get; set; }

        public void Deconstruct(
            out string transferToken,
            out bool files,
            out bool fields,
            out bool containerUrl,
            out IAccessTokenResult? accessTokenResult
            )
        {
            transferToken = TransferToken ?? throw new ArgumentNullException(nameof(TransferToken));
            files = Files;
            fields = Fields;
            containerUrl = ContainerUrl;
            accessTokenResult = AccessTokenResult;
        }
    }
}