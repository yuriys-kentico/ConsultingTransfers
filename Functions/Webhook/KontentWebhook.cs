using AzureStorage;
using AzureStorage.Models;

using Core;

using KenticoKontent;
using KenticoKontent.Models.Delivery;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Functions.Webhook
{
    public class KontentWebhook : AbstractFunction
    {
        private readonly IWebhookValidator webhookValidator;
        private readonly IStorageRepository storageRepository;
        private readonly ICoreContext coreContext;

        public KontentWebhook(
            IWebhookValidator webhookValidator,
            IStorageRepository storageRepository,
            ICoreContext coreContext
            )
        {
            this.webhookValidator = webhookValidator;
            this.storageRepository = storageRepository;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(KontentWebhook))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = webhook + "/{region:alpha:length(2)}"
            )] string body,
            IDictionary<string, string> headers,
            string region,
            ILogger log
            )
        {
            try
            {
                coreContext.Region = region;

                var (valid, getWebhook) = webhookValidator.ValidateWebhook(body, headers, region);

                if (!valid) return LogUnauthorized(log);

                var (data, message) = getWebhook();

                var (items, _) = data;

                switch (message.Operation)
                {
                    case "publish":
                        foreach (var item in items)
                        {
                            if (item.Type == TransferItem.Codename)
                            {
                                var container = await storageRepository.GetContainer(new GetContainerParameters
                                {
                                    ContainerName = storageRepository.GetSafeContainerName(item.Codename)
                                });

                                container.TransferToken = storageRepository.EncryptTransferToken(new TransferToken
                                {
                                    Codename = item.Codename,
                                    Localization = item.Language
                                });

                                container.DeleteWhen = DateTime.MaxValue;

                                await container.Update();
                            }
                        }
                        break;

                    case "unpublish":
                        foreach (var item in items)
                        {
                            if (item.Type == TransferItem.Codename)
                            {
                                var container = await storageRepository.GetContainer(new GetContainerParameters
                                {
                                    ContainerName = storageRepository.GetSafeContainerName(item.Codename)
                                });

                                container.DeleteWhen = DateTime.UtcNow.AddMonths(1);

                                await container.Update();
                            }
                        }
                        break;
                }

                return LogOk(log);
            }
            catch (Exception ex)
            {
                return LogException(log, ex);
            }
        }
    }
}