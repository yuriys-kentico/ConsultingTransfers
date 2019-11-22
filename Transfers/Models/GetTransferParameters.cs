using Authorization.Models;

using System;

namespace Transfers.Models
{
    public class GetTransferParameters
    {
        public string? TransferToken { get; set; }

        public bool Files { get; set; }

        public bool Fields { get; set; }

        public bool ContainerUrl { get; set; }

        public IAccessTokenResult? AccessTokenResult { get; set; }

        public void Deconstruct(
            out string transferToken,
            out bool files,
            out bool fields,
            out bool containerUrl,
            out IAccessTokenResult? accessTokenResult
            )
        {
            transferToken = TransferToken ?? throw new ArgumentNullException(nameof(transferToken));
            files = Files;
            fields = Fields;
            containerUrl = ContainerUrl;
            accessTokenResult = AccessTokenResult;
        }
    }
}