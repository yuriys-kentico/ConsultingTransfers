using System;

using Functions.Models;

using KenticoCloud.Delivery;

namespace Functions
{
    public static class AzureFunctionHelper
    {
        public static string GetEnvironmentVariable(params string[] variableParts)
        {
            var key = string.Join(':', variableParts);

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }

        public static IDeliveryClient GetDeliveryClient(string accountName)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(GetEnvironmentVariable(accountName, "projectId"))
                    .UseSecuredProductionApi(GetEnvironmentVariable(accountName, "securedApiKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new TypeProvider())
                .Build();
    }
}