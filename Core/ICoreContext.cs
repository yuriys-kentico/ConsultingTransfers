using System.Collections.Generic;

namespace Core
{
    public interface ICoreContext
    {
        string Region { get; set; }

        string? Localization { get; set; }

        IEnumerable<string> Regions { get; }

        string? DefaultLocalization { get; }

        string? ProjectId { get; }

        string? DeliveryApiSecureAccessKey { get; }

        string? ContentManagementApiKey { get; }

        string? WebhookSecret { get; }
    }
}