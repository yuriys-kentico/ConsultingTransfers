using Core;

using KenticoCloud.Delivery;

using KenticoKontent.Models;

namespace KenticoKontent
{
    public static class KenticoKontentHelper
    {
        public static IDeliveryClient GetDeliveryClient(string accountName)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(AzureFunctionHelper.GetSetting(accountName, "projectId"))
                    .UseSecuredProductionApi(AzureFunctionHelper.GetSetting(accountName, "deliveryApiSecureAccessKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new KenticoKontentTypeProvider())
                .Build();
    }
}