using KenticoCloud.Delivery;

namespace Functions.KenticoCloud
{
    public static class KenticoCloud
    {
        public static IDeliveryClient GetDeliveryClient(string accountName)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(AzureFunctionHelper.GetEnvironmentVariable(accountName, "projectId"))
                    .UseSecuredProductionApi(AzureFunctionHelper.GetEnvironmentVariable(accountName, "securedApiKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new TypeProvider())
                .Build();
    }
}