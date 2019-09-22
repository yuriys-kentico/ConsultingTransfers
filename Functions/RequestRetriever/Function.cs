using System;
using System.Threading.Tasks;

using Authorization;
using Authorization.Models;

using AzureStorage;
using AzureStorage.Models;

using Core;

using Encryption;

using KenticoKontent;
using KenticoKontent.Models;

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
        private readonly IStorageService storageService;

        public Function(IAccessTokenValidator tokenProvider, IEncryptionService encryptionService, IStorageService storageService)
        {
            this.tokenProvider = tokenProvider;
            this.encryptionService = encryptionService;
            this.storageService = storageService;
        }

        [FunctionName(nameof(RequestRetriever))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            try
            {
                var (accountName, containerToken) = await AzureFunctionHelper.GetPayloadAsync<SasTokenRequest>(request);
                var itemName = encryptionService.Decrypt(containerToken);
                var containerName = storageService.GetSafeStorageName(itemName);
                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                string sasToken;

                switch (tokenResult.Status)
                {
                    case AccessTokenStatus.Valid:
                        sasToken = storageService.GetAccountSasToken(accountName);
                        break;

                    case AccessTokenStatus.NoToken:
                        sasToken = storageService.GetContainerSasToken(accountName, containerName);
                        break;

                    case AccessTokenStatus.Expired:
                    default:
                        return new NotFoundResult();
                }

                var requestItem = await GetRequestItem(accountName, itemName);

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

        private static async Task<RequestItem> GetRequestItem(string accountName, string itemName)
        {
            var response = await KenticoKontentHelper
                .GetDeliveryClient(accountName)
                .GetItemAsync<Request>(itemName);

            return new RequestItem(response.Item, null);
        }
    }
}