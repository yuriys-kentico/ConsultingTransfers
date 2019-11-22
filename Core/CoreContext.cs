using System;
using System.Collections.Generic;
using System.Linq;

namespace Core
{
    public class CoreContext : ICoreContext
    {
        public string Region { get; set; } = "";

        public string? Localization { get; set; }

        public IEnumerable<string> Regions
            => CoreHelper.GetSetting(nameof(Regions))?.Split(';', StringSplitOptions.RemoveEmptyEntries)
            ?? Enumerable.Empty<string>();

        public string? DefaultLocalization => CoreHelper.GetSetting(Region, "Default", nameof(Localization));

        public string? ProjectId => CoreHelper.GetSetting(Region, nameof(ProjectId));

        public string? DeliveryApiSecureAccessKey => CoreHelper.GetSetting(Region, nameof(DeliveryApiSecureAccessKey));

        public string? ContentManagementApiKey => CoreHelper.GetSetting(Region, nameof(ContentManagementApiKey));

        public string? WebhookSecret => CoreHelper.GetSetting(Region, nameof(WebhookSecret));
    }
}