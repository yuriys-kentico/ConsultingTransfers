using System;
using System.Threading.Tasks;

using AzureStorage;

using Core;

using KenticoKontent;
using KenticoKontent.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Functions
{
    public class DeleteTransfer
    {
        private readonly IWebhookValidator webhookValidator;
        private readonly IStorageService storageService;

        public DeleteTransfer(IWebhookValidator webhookValidator, IStorageService storageService)
        {
            this.webhookValidator = webhookValidator;
            this.storageService = storageService;
        }

        [FunctionName(nameof(DeleteTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            try
            {
                var (valid, getWebhook) = await webhookValidator.ValidateWebhook(request, "delete");

                if (!valid) return new UnauthorizedResult();

                var (data, message) = getWebhook();

                if (message.Operation == "unpublish")
                {
                    var blobClient = storageService.GetCloudBlobClient(request.Query["accountName"]);

                    await DeleteContainers(data.Items, blobClient);
                }

                return new OkResult();
            }
            catch (Exception ex)
            {
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }

        private async Task DeleteContainers(Item[] items, CloudBlobClient blobClient)
        {
            foreach (var item in items)
            {
                var containerName = storageService.GetSafeStorageName(item.Codename);
                var container = blobClient.GetContainerReference(containerName);

                await container.DeleteAsync();
            }
        }
    }
}