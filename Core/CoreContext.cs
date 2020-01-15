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
            => CoreHelper.GetSetting<string>(nameof(Regions))?.Split(';', StringSplitOptions.RemoveEmptyEntries)
            ?? Enumerable.Empty<string>();

        public string DefaultLocalization => CoreHelper.GetSetting<string>(Region, "Default", nameof(Localization));

        public string ProjectId => CoreHelper.GetSetting<string>(Region, nameof(ProjectId));

        public string DeliveryApiSecureAccessKey => CoreHelper.GetSetting<string>(Region, nameof(DeliveryApiSecureAccessKey));

        public string ContentManagementApiKey => CoreHelper.GetSetting<string>(Region, nameof(ContentManagementApiKey));

        public string WebhookSecret => CoreHelper.GetSetting<string>(Region, nameof(WebhookSecret));
    }
}