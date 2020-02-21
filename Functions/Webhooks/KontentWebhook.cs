using AzureStorage;
using AzureStorage.Models;

using Core;

using KenticoKontent;
using KenticoKontent.Models.Delivery;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Functions.Webhooks
{
    public class KontentWebhook : BaseFunction
    {
        private readonly IWebhookValidator webhookValidator;
        private readonly IStorageRepository storageRepository;
        private readonly ICoreContext coreContext;

        public KontentWebhook(
            ILogger<KontentWebhook> logger,
            IWebhookValidator webhookValidator,
            IStorageRepository storageRepository,
            ICoreContext coreContext
            ) : base(logger)
        {
            this.webhookValidator = webhookValidator;
            this.storageRepository = storageRepository;
            this.coreContext = coreContext;
        }

        [FunctionName(nameof(KontentWebhook))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                "post",
                Route = Routes.KontentWebhook
            )] string body,
            IDictionary<string, string> headers,
            string region
            )
        {
            try
            {
                coreContext.SetRegion(region);

                var (valid, getWebhook) = webhookValidator.ValidateWebhook(body, headers, region);

                if (!valid) return LogUnauthorized();

                var (data, message) = getWebhook();

                var (items, _) = data;

                switch (message.Type)
                {
                    case "content_item_variant":
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

                                        if (string.IsNullOrEmpty(container.TransferToken))
                                        {
                                            container.TransferToken = storageRepository.EncryptTransferToken(new TransferToken
                                            {
                                                Codename = item.Codename,
                                                Localization = item.Language,
                                                Region = coreContext.Region.Name
                                            });
                                        }

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

                            case "archive":
                                foreach (var item in items)
                                {
                                    if (item.Type == TransferItem.Codename)
                                    {
                                        var container = await storageRepository.GetContainer(new GetContainerParameters
                                        {
                                            ContainerName = storageRepository.GetSafeContainerName(item.Codename)
                                        });

                                        await container.Delete();
                                    }
                                }
                                break;
                        }
                        break;
                }

                return LogOk();
            }
            catch (Exception ex)
            {
                return LogException(ex);
            }
        }
    }
}