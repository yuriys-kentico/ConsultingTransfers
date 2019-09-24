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

namespace Functions
{
    public class GetTransfer
    {
        private readonly IAccessTokenValidator tokenProvider;
        private readonly IEncryptionService encryptionService;
        private readonly IStorageService storageService;

        public GetTransfer(IAccessTokenValidator tokenProvider, IEncryptionService encryptionService, IStorageService storageService)
        {
            this.tokenProvider = tokenProvider;
            this.encryptionService = encryptionService;
            this.storageService = storageService;
        }

        [FunctionName(nameof(GetTransfer))]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            try
            {
                var (region, containerToken) = await AzureFunctionHelper.GetPayloadAsync<RequestsRequest>(request);
                var itemName = encryptionService.Decrypt(containerToken);
                var containerName = storageService.GetSafeStorageName(itemName);
                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                string containerUrl;

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        containerUrl = storageService.GetAdminContainerUrl(region, containerName);
                        break;

                    case NoAccessTokenResult _:
                        containerUrl = storageService.GetPublicContainerUrl(region, containerName);
                        break;

                    default:
                        return new NotFoundResult();
                }

                var response = await KenticoKontentHelper
                    .GetDeliveryClient(region)
                    .GetItemAsync<TransferItem>(itemName);

                var transfer = new Transfer(response.Item, containerToken);

                return new OkObjectResult(new
                {
                    containerUrl,
                    containerName,
                    transfer
                });
            }
            catch (Exception ex)
            {
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }
    }
}