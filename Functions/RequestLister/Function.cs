using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.Authorization;
using Functions.Models;

using KenticoCloud.Delivery;

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

        public Function(IAccessTokenValidator tokenProvider)
        {
            this.tokenProvider = tokenProvider;
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

        private static async Task<OkObjectResult> GetRequests(HttpRequest request)
        {
            var (accountName, _, _, _) = await AzureFunctionHelper.GetPayloadAsync<SasTokenRequest>(request);

            var response = await AzureFunctionHelper
                .GetDeliveryClient(accountName)
                .GetItemsAsync<Request>();

            var blobClient = AzureStorageHelper.GetCloudBlobClient(accountName);

            var requestItems = GetRequestItems(response, blobClient);

            return new OkObjectResult(new
            {
                requestItems
            });
        }

        private static IEnumerable<RequestItem> GetRequestItems(DeliveryItemListingResponse<Request> response, CloudBlobClient blobClient)
        {
            foreach (var request in response.Items)
            {
                var containerName = AzureStorageHelper.GetSafeStorageName(request.System.Codename);
                string containerToken = null;

                blobClient.ListContainers(containerName, ContainerListingDetails.Metadata)
                    .FirstOrDefault(container => container.Name == containerName)?
                    .Metadata.TryGetValue(AzureStorageHelper.ContainerToken, out containerToken);

                yield return new RequestItem(request, containerToken);
            }
        }
    }
}