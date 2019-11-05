using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using AzureStorage;
using AzureStorage.Models;

using Encryption.Models;

using KenticoKontent;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Functions
{
    public class KontentWebhook : AbstractFunction
    {
        private readonly IWebhookValidator webhookValidator;
        private readonly IStorageService storageService;

        public KontentWebhook(IWebhookValidator webhookValidator, IStorageService storageService)
        {
            this.webhookValidator = webhookValidator;
            this.storageService = storageService;
        }

        [FunctionName(nameof(KontentWebhook))]
        public async Task<IActionResult> Run(
            [HttpTrigger(
                AuthorizationLevel.Function,
                "post",
                Route = "webhook/{region:alpha:length(2)}"
            )] string body,
            IDictionary<string, string> headers,
            string region,
            ILogger log
            )
        {
            try
            {
                var (valid, getWebhook) = webhookValidator.ValidateWebhook(body, headers, region);

                if (!valid) return LogUnauthorized(log);

                var (data, message) = getWebhook();

                switch (message.Operation)
                {
                    case "publish":
                        foreach (var item in data.Items)
                        {
                            await storageService.CreateContainer(new CreateContainerParameters
                            {
                                Region = region,
                                ContainerName = storageService.GetSafeContainerName(item.Codename),
                                TransferToken = new TransferToken
                                {
                                    Region = region,
                                    Codename = item.Codename
                                }
                            });
                        }
                        break;

                    case "unpublish":
                        foreach (var item in data.Items)
                        {
                            await storageService.DeleteContainer(new GetContainerParameters
                            {
                                Region = region,
                                ContainerName = storageService.GetSafeContainerName(item.Codename)
                            });
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