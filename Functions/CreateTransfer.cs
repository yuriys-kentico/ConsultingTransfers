using System;
using System.Threading.Tasks;

using AzureStorage;

using Core;

using Encryption;

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
    public class CreateTransfer
    {
        private readonly IEncryptionService encryptionService;
        private readonly IWebhookValidator webhookValidator;
        private readonly IStorageService storageService;

        public CreateTransfer(IEncryptionService encryptionService, IWebhookValidator webhookValidator, IStorageService storageService)
        {
            this.encryptionService = encryptionService;
            this.webhookValidator = webhookValidator;
            this.storageService = storageService;
        }

        [FunctionName(nameof(CreateTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            try
            {
                var (valid, getWebhook) = await webhookValidator.ValidateWebhook(request, "create");

                if (!valid) return new UnauthorizedResult();

                var (data, message) = getWebhook();

                if (message.Operation == "publish")
                {
                    var blobClient = storageService.GetCloudBlobClient(request.Query["accountName"]);

                    await CreateContainers(data.Items, blobClient);
                }

                return new OkResult();
            }
            catch (Exception ex)
            {
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }

        private async Task CreateContainers(Item[] items, CloudBlobClient blobClient)
        {
            foreach (var item in items)
            {
                var containerName = storageService.GetSafeStorageName(item.Codename);
                var container = blobClient.GetContainerReference(containerName);

                await container.CreateIfNotExistsAsync();

                container.Metadata.Add(storageService.ContainerToken, encryptionService.Encrypt(item.Codename));

                await container.SetMetadataAsync();
            }
        }
    }
}