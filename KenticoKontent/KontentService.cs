using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

using Core;

using Kentico.Kontent.Delivery;

using KenticoKontent.Models;
using KenticoKontent.Models.ContentManagement;
using KenticoKontent.Models.Delivery;

using Newtonsoft.Json;

namespace KenticoKontent
{
    public class KontentService : IKontentService
    {
        private readonly HttpClient httpClient;

        private static readonly Func<string, string> BaseUri = (string region)
            => $@"https://manage.kontent.ai/v2/projects/{CoreHelper.GetSetting(region, "projectId")}/items";

        public KontentService(HttpClient httpClient)
        {
            this.httpClient = httpClient;
        }

        public async Task<IEnumerable<TransferItem>> GetTransfers(string region)
        {
            var response = await GetDeliveryClient(region)
                .GetItemsAsync<TransferItem>();

            return response.Items;
        }

        public async Task<T> GetKontentItem<T>(GetKontentParameters getKontentItemParameters)
        {
            var (region, codename, localization) = getKontentItemParameters;

            return await GetDeliveryClient(region)
                .GetItemAsync<T>(codename, new LanguageParameter(localization));
        }

        public async Task<TransferItem> CreateTransfer(CreateTransferItemParameters createTransferItemParameters)
        {
            var (region, _, _, _, _, localization) = createTransferItemParameters;

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "bearer",
                CoreHelper.GetSetting(region, "contentManagementApiKey")
            );

            var contentItemResponse = await AddContentItem(createTransferItemParameters);

            await UpsertLanguageVariant(createTransferItemParameters, contentItemResponse.Codename);

            await PublishLanguageVariant(createTransferItemParameters, contentItemResponse.Codename);

            return await GetKontentItem<TransferItem>(new GetKontentParameters
            {
                Region = region,
                Codename = contentItemResponse.Codename,
                Localization = localization
            });
        }

        private async Task<ContentItemResponse> AddContentItem(CreateTransferItemParameters createTransferItemParameters)
        {
            var (region, name, _, _, _, _) = createTransferItemParameters;

            var requestUri = BaseUri(region);

            var request = new
            {
                name,
                type = new
                {
                    codename = "transfer"
                }
            };

            var response = await httpClient.PostAsJsonAsync(requestUri, request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsAsync<APIErrorResponse>();
                throw errorContent.GetException();
            }

            return await response.Content.ReadAsAsync<ContentItemResponse>();
        }

        private async Task UpsertLanguageVariant(CreateTransferItemParameters createTransferItemParameters, string codename)
        {
            var (region, _, customer, requester, fields, _) = createTransferItemParameters;

            var requestUri = $"{BaseUri(region)}/codename/{codename}/variants/codename/en-US";

            var request = new
            {
                elements = new[]
                {
                    new
                    {
                        element = new
                        {
                            codename = "info"
                        },
                        value = JsonConvert.SerializeObject(new
                        {
                            customer,
                            requester
                        })
                    },
                    new
                    {
                        element = new
                        {
                            codename = "fields"
                        },

                        // TODO: This should contain components based on fields
                        value = "<p><br/></p>"
                    }
                }
            };

            var response = await httpClient.PutAsJsonAsync(requestUri, request);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsAsync<APIErrorResponse>();
                throw errorContent.GetException();
            }
        }

        private async Task PublishLanguageVariant(CreateTransferItemParameters createTransferItemParameters, string codename)
        {
            var (region, _, _, _, _, _) = createTransferItemParameters;

            var requestUri = $"{BaseUri(region)}/codename/{codename}/variants/codename/en-US/publish";

            var response = await httpClient.PutAsync(requestUri, null);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsAsync<APIErrorResponse>();
                throw errorContent.GetException();
            }
        }

        private IDeliveryClient GetDeliveryClient(string region)
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(CoreHelper.GetSetting(region, "projectId"))
                    .UseProductionApi(CoreHelper.GetSetting(region, "deliveryApiSecureAccessKey"))
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new KenticoKontentTypeProvider())
                .Build();

        public T ResolveItem<T>(T kontentItem, object replacementsObject, params string[] propertyNames)
        {
            var replacements = replacementsObject
                .GetType()
                .GetProperties()
                .Where(property => property.PropertyType == typeof(string))
                .Select(property => (
                    property.Name,
                    Value: property.GetValue(replacementsObject) as string
                    )
                );

            var itemProperties = kontentItem
                .GetType()
                .GetProperties()
                .Where(property => propertyNames.Contains(property.Name));

            foreach (var itemProperty in itemProperties)
            {
                var propertyValue = itemProperty.GetValue(kontentItem);

                if (propertyValue is string stringPropertyValue)
                {
                    var resolved = new StringBuilder(stringPropertyValue);

                    foreach (var (Name, Value) in replacements)
                    {
                        resolved.Replace($"{{{{{Name}}}}}", Value);
                    }

                    itemProperty.SetValue(kontentItem, resolved.ToString());
                }
            }

            return kontentItem;
        }
    }
}