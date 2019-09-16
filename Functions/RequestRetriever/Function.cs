using System;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Functions.RequestRetriever
{
    public static class Function
    {
        [FunctionName(nameof(RequestRetriever))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            string requestBody = await request.ReadAsStringAsync();

            try
            {
                var (accountName, accessToken, accountPermissions, containerToken, containerPermissions)
                    = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);

                var itemName = AzureStorageHelper.DecryptToken(containerToken);
                var containerName = AzureStorageHelper.GetSafeStorageName(itemName);
                var storageAccount = AzureStorageHelper.GetStorageAccount(accountName);

                string sasToken;

                if (AzureFunctionHelper.HasAccess(accessToken))
                {
                    sasToken = AzureStorageHelper.GetAccountSasToken(storageAccount, accountPermissions);
                }
                else
                {
                    sasToken = AzureStorageHelper.GetContainerSasToken(storageAccount, containerName, containerPermissions);
                }

                var requestItem = await GetRequest(accountName, itemName);

                return new OkObjectResult(new
                {
                    sasToken,
                    containerName,
                    requestItem
                });
            }
            catch (Exception ex)
            {
                return new ExceptionResult(ex, true);
            }
        }

        private static async Task<RequestItem> GetRequest(
            string accountName,
            string itemName
            )
        {
            var deliveryClient = KenticoKontentHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemAsync<Request>(itemName);

            return new RequestItem(response.Item, null);
        }
    }
}