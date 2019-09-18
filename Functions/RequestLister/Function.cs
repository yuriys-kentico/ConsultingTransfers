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
using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Functions.RequestLister
{
    public class Function
    {
        private readonly IAccessTokenProvider tokenProvider;

        public Function(IAccessTokenProvider tokenProvider)
        {
            this.tokenProvider = tokenProvider;
        }

        [FunctionName(nameof(RequestLister))]
        public async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
                ILogger log
                )
        {
            var tokenResult = await tokenProvider.ValidateTokenAsync(request);

            switch (tokenResult.Status)
            {
                case AccessTokenStatus.Valid:
                    try
                    {
                        return await GetRequests(request);
                    }
                    catch (Exception ex)
                    {
                        return new ExceptionResult(ex, true);
                    }

                case AccessTokenStatus.Error:
                    return new ExceptionResult(tokenResult.Exception, true);

                case AccessTokenStatus.Expired:
                case AccessTokenStatus.NoToken:
                default:
                    return new NotFoundResult();
            }
        }

        private static async Task<OkObjectResult> GetRequests(HttpRequest request)
        {
            string requestBody = await request.ReadAsStringAsync();

            var (accountName, _, _, _) = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);
            var deliveryClient = AzureFunctionHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemsAsync<Request>();

            var storageConnectionString = AzureFunctionHelper.GetEnvironmentVariable(accountName);
            var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();

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