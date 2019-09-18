using System;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.Authorization;
using Functions.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Functions.RequestRetriever
{
    public class Function
    {
        private readonly IAccessTokenProvider tokenProvider;

        public Function(IAccessTokenProvider tokenProvider)
        {
            this.tokenProvider = tokenProvider;
        }

        [FunctionName(nameof(RequestRetriever))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            string requestBody = await request.ReadAsStringAsync();

            try
            {
                var (accountName, accountPermissions, containerToken, containerPermissions)
                    = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);

                var itemName = AzureStorageHelper.DecryptToken(containerToken);
                var containerName = AzureStorageHelper.GetSafeStorageName(itemName);
                var storageAccount = AzureStorageHelper.GetStorageAccount(accountName);

                string sasToken;

                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                switch (tokenResult.Status)
                {
                    case AccessTokenStatus.Valid:
                        sasToken = AzureStorageHelper.GetAccountSasToken(storageAccount, accountPermissions);
                        break;

                    case AccessTokenStatus.Expired:
                        return new NotFoundResult();

                    case AccessTokenStatus.Error:
                        return new ExceptionResult(tokenResult.Exception, true);

                    case AccessTokenStatus.NoToken:
                    default:
                        sasToken = AzureStorageHelper.GetContainerSasToken(storageAccount, containerName, containerPermissions);
                        break;
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

        private static async Task<RequestItem> GetRequest(string accountName, string itemName)
        {
            var deliveryClient = AzureFunctionHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemAsync<Request>(itemName);

            return new RequestItem(response.Item, null);
        }
    }
}