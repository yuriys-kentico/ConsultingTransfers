using Core;

using Functions.Models;

using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;

using System;
using System.Linq;

namespace Functions.Webhooks
{
    public class StorageEvents : BaseFunction
    {
        private readonly Settings settings;

        public StorageEvents(
            ILogger<StorageEvents> logger,
            Settings settings
            ) : base(logger)
        {
            this.settings = settings;
        }

        [FunctionName(nameof(StorageEvents))]
        public void Run(
            [EventGridTrigger]EventGridEvent eventGridEvent
            )
        {
            try
            {
                if (!eventGridEvent.Topic.Contains(settings.AzureStorage.Events.TopicSubstring))
                {
                    return;
                }

                switch (eventGridEvent.EventType)
                {
                    case BlobEventTypes.MicrosoftStorageBlobCreated:
                        if (eventGridEvent.Data is StorageBlobCreatedEventData data
                            && !settings.AzureStorage.AllowedExtensions
                                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                                .Any(extension => data.Url.EndsWith(extension)))
                        {
                            LogOkObject(data);
                        }
                        break;
                }
            }
            catch (Exception ex)
            {
                LogException(ex);
            }
        }
    }
}