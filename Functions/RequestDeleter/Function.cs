using System;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.Models;
using Functions.Webhooks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Functions.RequestDeleter
{
    public class Function
    {
        private readonly IWebhookValidator webhookValidator;

        public Function(IWebhookValidator webhookValidator)
        {
            this.webhookValidator = webhookValidator;
        }

        [FunctionName(nameof(RequestDeleter))]
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
                    var blobClient = AzureStorageHelper.GetCloudBlobClient(request.Query["accountName"]);

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
                var containerName = AzureStorageHelper.GetSafeStorageName(item.Codename);
                var container = blobClient.GetContainerReference(containerName);

                await container.DeleteAsync();
            }
        }
    }
}