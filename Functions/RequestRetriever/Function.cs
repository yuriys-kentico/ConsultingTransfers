using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.KenticoCloud;

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

                if (HasAccess(accessToken))
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

        private static bool HasAccess(string accessToken)
        {
            return !string.IsNullOrEmpty(accessToken);
        }

        private static async Task<Request> GetRequest(
            string accountName,
            string itemName
            )
        {
            var deliveryClient = KenticoCloudHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemAsync<Request>(itemName);

            response.Item.Fields = Regex
                .Replace(response.Item.Fields, "<.*?>|\n", string.Empty)
                .Replace("}{", "},{");

            return response.Item;
        }
    }
}