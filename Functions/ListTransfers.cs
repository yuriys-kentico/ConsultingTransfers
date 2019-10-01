using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Authorization;
using Authorization.Models;

using AzureStorage;
using AzureStorage.Models;

using Core;

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
    public class ListTransfers
    {
        private readonly IAccessTokenValidator tokenProvider;
        private readonly IStorageService storageService;

        public ListTransfers(IAccessTokenValidator tokenProvider, IStorageService storageService)
        {
            this.tokenProvider = tokenProvider;
            this.storageService = storageService;
        }

        [FunctionName(nameof(ListTransfers))]
        public async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
                ILogger log
                )
        {
            try
            {
                var tokenResult = await tokenProvider.ValidateTokenAsync(request);

                switch (tokenResult)
                {
                    case ValidAccessTokenResult _:
                        return await GetTransfers(request);

                    default:
                        return new NotFoundResult();
                }
            }
            catch (Exception ex)
            {
                return AzureFunctionHelper.LogException(request, log, ex);
            }
        }

        private async Task<OkObjectResult> GetTransfers(HttpRequest request)
        {
            var specificRegion = (await AzureFunctionHelper.GetPayloadAsync<TransfersRequest>(request)).Region;

            var regions = string.IsNullOrEmpty(specificRegion)
                ? AzureFunctionHelper.GetSetting("regions").Split(';', StringSplitOptions.RemoveEmptyEntries)
                : new[] { specificRegion };

            List<Transfer> transfers = new List<Transfer>();

            foreach (var region in regions)
            {
                var response = await KenticoKontentHelper
                    .GetDeliveryClient(region)
                    .GetItemsAsync<TransferItem>();

                var blobClient = storageService.GetCloudBlobClient(region);

                transfers.AddRange(GetTransfers(response.Items, blobClient, region));
            }

            return new OkObjectResult(new
            {
                transfers
            });
        }

        private IEnumerable<Transfer> GetTransfers(IReadOnlyList<TransferItem> transferItems, CloudBlobClient blobClient, string region)
        {
            foreach (var transferItem in transferItems)
            {
                var containerName = storageService.GetSafeStorageName(transferItem.System.Codename);
                string transferToken = null;

                blobClient.ListContainers(containerName, ContainerListingDetails.Metadata)
                    .FirstOrDefault(container => container.Name == containerName)?
                    .Metadata.TryGetValue(storageService.TransferToken, out transferToken);

                if (!string.IsNullOrEmpty(transferToken))
                {
                    yield return new Transfer(transferItem, transferToken, region);
                }
            }
        }
    }
}