using Core;

using Functions.Models;

using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Linq;

namespace Functions.Webhooks
{
    public class StorageEvents : BaseFunction
    {
        private static string AzureStorageEventsTopicSubstring => CoreHelper.GetSetting<string>("AzureStorage", "Events", "TopicSubstring");

        private static IEnumerable<string> AzureStorageAllowedExtensions => CoreHelper.GetSetting<string>("AzureStorage", "AllowedExtensions")
            .Split(';', StringSplitOptions.RemoveEmptyEntries);

        public StorageEvents(
            ILogger<StorageEvents> logger
            ) : base(logger)
        {
        }

        [FunctionName(nameof(StorageEvents))]
        public void Run(
            [EventGridTrigger]EventGridEvent eventGridEvent
            )
        {
            try
            {
                if (!eventGridEvent.Topic.Contains(AzureStorageEventsTopicSubstring))
                {
                    return;
                }

                switch (eventGridEvent.EventType)
                {
                    case BlobEventTypes.MicrosoftStorageBlobCreated:
                        if (eventGridEvent.Data is StorageBlobCreatedEventData data
                            && !AzureStorageAllowedExtensions.Any(extension => data.Url.EndsWith(extension)))
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