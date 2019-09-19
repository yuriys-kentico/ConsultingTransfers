using System;
using System.Threading.Tasks;

using Functions.Models;

using KenticoCloud.Delivery;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace Functions
{
    public static class AzureFunctionHelper
    {
        public static async Task<T> GetPayloadAsync<T>(HttpRequest request)
        {
            var requestBody = await request.ReadAsStringAsync();

            return GetPayload<T>(requestBody);
        }

        public static T GetPayload<T>(string requestBody)
        {
            return JsonConvert.DeserializeObject<T>(requestBody);
        }

        public static string GetEnvironmentVariable(params string[] variableParts)
        {
            var key = string.Join(':', variableParts);

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }

        public static IDeliveryClient GetDeliveryClient(string accountName)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(GetEnvironmentVariable(accountName, "projectId"))
                    .UseSecuredProductionApi(GetEnvironmentVariable(accountName, "deliveryApiSecureAccessKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new KontentTypeProvider())
                .Build();

        public static NotFoundResult LogException(HttpRequest request, ILogger log, Exception ex)
        {
            log.LogError(ex, $"Request: {request.GetDisplayUrl()}");

            return new NotFoundResult();
        }
    }
}