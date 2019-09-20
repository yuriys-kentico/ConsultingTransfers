using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Authorization;
using Authorization.Models;

using AzureStorage;
using AzureStorage.Models;

using Core;

using KenticoCloud.Delivery;

using KenticoKontent;
using KenticoKontent.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace Functions.RequestLister
{
    public class Function
    {
        private readonly IAccessTokenValidator tokenProvider;
        private readonly IStorageService storageService;

        public Function(IAccessTokenValidator tokenProvider, IStorageService storageService)
        {
            this.tokenProvider = tokenProvider;
            this.storageService = storageService;
        }

        [FunctionName(nameof(RequestLister))]
        public async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
                ILogger log
                )
        {
            try
            {
                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                switch (tokenResult.Status)
                {
                    case AccessTokenStatus.Valid:
                        return await GetRequests(request);

                    case AccessTokenStatus.NoToken:
                    case AccessTokenStatus.Expired:
                    default:
                        return new NotFoundResult();
                }
            }
            catch (Exception ex)
            {
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }

        private async Task<OkObjectResult> GetRequests(HttpRequest request)
        {
            var (accountName, _) = await AzureFunctionHelper.GetPayloadAsync<SasTokenRequest>(request);

            var response = await KenticoKontentHelper
                .GetDeliveryClient(accountName)
                .GetItemsAsync<Request>();

            var blobClient = storageService.GetCloudBlobClient(accountName);

            var requestItems = GetRequestItems(response, blobClient);

            return new OkObjectResult(new
            {
                requestItems
            });
        }

        private IEnumerable<RequestItem> GetRequestItems(DeliveryItemListingResponse<Request> response, CloudBlobClient blobClient)
        {
            foreach (var request in response.Items)
            {
                var containerName = storageService.GetSafeStorageName(request.System.Codename);
                string containerToken = null;

                blobClient.ListContainers(containerName, ContainerListingDetails.Metadata)
                    .FirstOrDefault(container => container.Name == containerName)?
                    .Metadata.TryGetValue(storageService.ContainerToken, out containerToken);

                yield return new RequestItem(request, containerToken);
            }
        }
    }
}