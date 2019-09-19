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

namespace Functions.RequestRetriever
{
    public class Function
    {
        private readonly IAccessTokenValidator tokenProvider;
        private readonly IEncryptionService encryptionService;

        public Function(IAccessTokenValidator tokenProvider, IEncryptionService encryptionService)
        {
            this.tokenProvider = tokenProvider;
            this.encryptionService = encryptionService;
        }

        [FunctionName(nameof(RequestRetriever))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            try
            {
                var (accountName, accountPermissions, containerToken, containerPermissions)
                    = await AzureFunctionHelper.GetPayloadAsync<SasTokenRequest>(request);

                var itemName = encryptionService.Decrypt(containerToken);
                var containerName = AzureStorageHelper.GetSafeStorageName(itemName);

                string sasToken;

                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                switch (tokenResult.Status)
                {
                    case AccessTokenStatus.Valid:
                        sasToken = AzureStorageHelper.GetAccountSasToken(accountName, accountPermissions);
                        break;

                    case AccessTokenStatus.NoToken:
                        sasToken = AzureStorageHelper.GetContainerSasToken(accountName, containerName, containerPermissions);
                        break;

                    case AccessTokenStatus.Expired:
                    default:
                        return new NotFoundResult();
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
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }

        private static async Task<RequestItem> GetRequest(string accountName, string itemName)
        {
            var response = await AzureFunctionHelper
                .GetDeliveryClient(accountName)
                .GetItemAsync<Request>(itemName);

            return new RequestItem(response.Item, null);
        }
    }
}