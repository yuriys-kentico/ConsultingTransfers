using Core;

using System;

namespace AzureStorage.Models
{
    public class TransferToken
    {
        private readonly ICoreContext coreContext;

        public string? Region { private get; set; }

        public string? Codename { private get; set; }

        public string? Localization { private get; set; }

        public TransferToken(ICoreContext coreContext)
        {
            this.coreContext = coreContext;
        }

        public void Deconstruct(
            out string region,
            out string codename,
            out string localization
            )
        {
            region = Region ?? coreContext.Region ?? throw new ArgumentNullException(nameof(Region));
            codename = Codename ?? throw new ArgumentNullException(nameof(Codename));
            localization = Localization ?? coreContext.Localization ?? throw new ArgumentNullException(nameof(Localization));
        }
    }
}