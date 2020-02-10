using System;

namespace Core
{
    public class Settings
    {
        public string Regions { get; set; } = string.Empty;

        public Region Us { get; set; } = default!;

        public Region Eu { get; set; } = default!;

        public string TokenSecret { get; set; } = string.Empty;

        public Authorization Authorization { get; set; } = default!;

        public AzureStorage AzureStorage { get; set; } = default!;

        public KenticoKontent KenticoKontent { get; set; } = default!;

        public MicrosoftTeams MicrosoftTeams { get; set; } = default!;

        public Client Client { get; set; } = default!;
    }

    public class Region
    {
        public string Name { get; set; } = string.Empty;

        public string StorageConnectionString { get; set; } = string.Empty;

        public Guid ProjectId { get; set; }

        public string DeliveryApiSecureAccessKey { get; set; } = string.Empty;

        public string ContentManagementApiKey { get; set; } = string.Empty;

        public string WebhookSecret { get; set; } = string.Empty;

        public string DefaultLocalization { get; set; } = string.Empty;

        public string StorageEndpoint { get; set; } = string.Empty;

        public string FileEndpoint { get; set; } = string.Empty;
    }

    public class Authorization
    {
        public string MetadataAddress { get; set; } = string.Empty;

        public string Audiences { get; set; } = string.Empty;

        public string Issuer { get; set; } = string.Empty;
    }

    public class AzureStorage
    {
        public Sas Sas { get; set; } = default!;

        public Events Events { get; set; } = default!;

        public string AllowedExtensions { get; set; } = string.Empty;
    }

    public class Sas
    {
        public double ExpirationHours { get; set; }
    }

    public class Events
    {
        public string TopicSubstring { get; set; } = string.Empty;
    }

    public class KenticoKontent
    {
        public int PublishLanguageVariantRetry { get; set; }
    }

    public class MicrosoftTeams
    {
        public Channels Channels { get; set; } = default!;
    }

    public class Channels
    {
        public string Transfers { get; set; } = string.Empty;
    }

    public class Client
    {
        public string TransferUrl { get; set; } = string.Empty;

        public string TransfersUrl { get; set; } = string.Empty;
    }
}