using System;
using System.Threading.Tasks;

using Functions.Models;
using Functions.Webhooks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Functions.RequestCreator
{
    public class Function
    {
        private readonly IEncryptionService encryptionService;
        private readonly IWebhookValidator webhookValidator;

        public Function(IEncryptionService encryptionService, IWebhookValidator webhookValidator)
        {
            this.encryptionService = encryptionService;
            this.webhookValidator = webhookValidator;
        }

        [FunctionName(nameof(RequestCreator))]
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
                    var blobClient = AzureStorageHelper.GetCloudBlobClient(request.Query["accountName"]);

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
                var containerName = AzureStorageHelper.GetSafeStorageName(item.Codename);
                var container = blobClient.GetContainerReference(containerName);

                var created = await container.CreateIfNotExistsAsync();

                container.Metadata.Add(AzureStorageHelper.ContainerToken, encryptionService.Encrypt(item.Codename));

                await container.SetMetadataAsync();
            }
        }
    }
}