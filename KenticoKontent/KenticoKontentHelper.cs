using Core;

using KenticoCloud.Delivery;

using KenticoKontent.Models;

namespace KenticoKontent
{
    public static class KenticoKontentHelper
    {
        public static IDeliveryClient GetDeliveryClient(string region)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(AzureFunctionHelper.GetSetting(region, "projectId"))
                    .UseSecuredProductionApi(AzureFunctionHelper.GetSetting(region, "deliveryApiSecureAccessKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new KenticoKontentTypeProvider())
                .Build();
    }
}