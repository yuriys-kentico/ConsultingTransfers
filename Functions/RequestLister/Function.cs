using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

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
        [FunctionName(nameof(RequestLister))]
        public async Task<IActionResult> Run(
                [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequest request,
                ILogger log
                )
        {
            string requestBody = await request.ReadAsStringAsync();

            try
            {
                var (accountName, _, _, _)
                    = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);

                var storageConnectionString = AzureFunctionHelper.GetEnvironmentVariable(accountName);

                var requestItems = await GetRequests(accountName, storageConnectionString);

                return new OkObjectResult(new
                {
                    requestItems
                });
            }
            catch (Exception ex)
            {
                return new ExceptionResult(ex, true);
            }
        }

        private static async Task<IEnumerable<RequestItem>> GetRequests(
            string accountName
, string storageConnectionString
            )
        {
            var deliveryClient = KenticoKontentHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemsAsync<Request>();

            var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();

            return GetRequestItems(response, blobClient);
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