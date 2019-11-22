using System;

namespace AzureStorage.Models
{
    public class TransferToken
    {
        public string? Region { get; set; }

        public string? Codename { get; set; }

        public string? Localization { get; set; }

        public void Deconstruct(
            out string region,
            out string codename,
            out string localization
            )
        {
            region = Region ?? throw new ArgumentNullException(nameof(Region));
            codename = Codename ?? throw new ArgumentNullException(nameof(Codename));
            localization = Localization ?? throw new ArgumentNullException(nameof(Localization));
        }
    }
}