using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Http;

using Functions.RequestRetriever;
using Functions.KenticoCloud;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Functions.RequestLister
{
    public static class Function
    {
        [FunctionName(nameof(RequestLister))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            string requestBody = await request.ReadAsStringAsync();

            try
            {
                var (accountName, accessToken, _, _, _)
                    = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);

                var requestItems = await GetRequests(accountName);

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

        private static async Task<IReadOnlyList<Request>> GetRequests(
            string accountName
            )
        {
            var deliveryClient = KenticoCloudHelper.GetDeliveryClient(accountName);

            var response = await deliveryClient.GetItemsAsync<Request>();

            return response.Items;
        }
    }
}