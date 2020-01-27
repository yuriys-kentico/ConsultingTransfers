using Core;

using Kentico.Kontent.Delivery;

using KenticoKontent.Models;
using KenticoKontent.Models.ContentManagement;
using KenticoKontent.Models.ContentManagement.Components;
using KenticoKontent.Models.ContentManagement.Elements;
using KenticoKontent.Models.Delivery;

using Newtonsoft.Json.Serialization;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

using ContentItem = KenticoKontent.Models.ContentManagement.ContentItem;

namespace KenticoKontent
{
    public class KontentRepository : IKontentRepository
    {
        private readonly HttpClient httpClient;
        private readonly ICoreContext coreContext;

        public KontentRepository(
            HttpClient httpClient,
            ICoreContext coreContext
            )
        {
            this.httpClient = httpClient;
            this.coreContext = coreContext;
        }

        public async Task<IEnumerable<TransferItem>> GetTransfers()
        {
            var response = await GetDeliveryClient()
                .GetItemsAsync<TransferItem>();

            return response.Items;
        }

        public async Task<T> GetKontentItem<T>(GetKontentParameters getKontentItemParameters) where T : notnull
        {
            return await GetDeliveryClient()
                .GetItemAsync<T>(
                    getKontentItemParameters.Codename,
                    new LanguageParameter(coreContext.Localization ?? coreContext.DefaultLocalization)
                    );
        }

        private IDeliveryClient GetDeliveryClient()
            => DeliveryClientBuilder
                .WithOptions(builder => builder
                    .WithProjectId(coreContext.ProjectId)
                    .UseProductionApi(coreContext.DeliveryApiSecureAccessKey)
                    .Build())
                .WithInlineContentItemsResolver(new Field())
                .WithTypeProvider(new KenticoKontentTypeProvider())
                .Build();

        public async Task<TransferItem> CreateTransferItem(CreateTransferItemParameters createTransferItemParameters)
        {
            var contentItemResponse = await AddContentItem(createTransferItemParameters);

            var variant = GetNewTransferLanguageVariant(createTransferItemParameters);

            await UpsertLanguageVariant(new UpsertLanguageVariantParameters
            {
                Codename = contentItemResponse.Codename,
                Variant = variant,
            });

            var getKontentItemParameters = new GetKontentParameters
            {
                Codename = contentItemResponse.Codename
            };

            await PublishLanguageVariant(getKontentItemParameters);

            TransferItem? transferItem = null;
            var retryAttempts = CoreHelper.GetSetting<int>("KenticoKontent", "PublishLanguageVariantRetry");

            while (retryAttempts > 0)
            {
                try
                {
                    transferItem = await GetKontentItem<TransferItem>(getKontentItemParameters);
                }
                catch { }

                if (transferItem != null)
                {
                    return transferItem;
                }
                else
                {
                    await Task.Delay(1000);
                    retryAttempts--;
                }
            }

            throw new Exception($"Published language variant {contentItemResponse.Codename} but could not get it from Delivery.");
        }

        private string ConfigureClient(string endpoint = "")
        {
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "bearer",
                coreContext.ContentManagementApiKey
            );

            var projectId = coreContext.ProjectId;

            return $@"https://manage.kontent.ai/v2/projects/{projectId}/items{endpoint}";
        }

        private async Task<ContentItemResponse> AddContentItem(CreateTransferItemParameters createTransferItemParameters)
        {
            var (name, _, _, _) = createTransferItemParameters;

            var requestUri = ConfigureClient();

            var request = new ContentItem
            {
                Name = name,
                Type = new Reference
                {
                    Codename = "transfer"
                }
            };

            var response = await PostAsJsonAsync(requestUri, request);

            return await response.Content.ReadAsAsync<ContentItemResponse>();
        }

        private async Task UpsertLanguageVariant(UpsertLanguageVariantParameters upsertLanguageVariantParameters)
        {
            var (codename, variant) = upsertLanguageVariantParameters;

            var requestUri = ConfigureClient($"/codename/{codename}/variants/codename/{coreContext.Localization ?? coreContext.DefaultLocalization}");

            await PutAsJsonAsync(requestUri, variant);
        }

        private static LanguageVariant GetNewTransferLanguageVariant(CreateTransferItemParameters createTransferItemParameters)
        {
            var (_, customer, requester, fields) = createTransferItemParameters;

            var variant = new LanguageVariant
            {
                Elements =
                {
                    new CustomElement
                    {
                        Element = new Reference
                        {
                            Codename = "info"
                        },
                        Value = CoreHelper.Serialize(new
                        {
                            customer,
                            requester
                        })
                    },
                    new RichTextElement
                    {
                        Element = new Reference
                        {
                            Codename = "fields"
                        }
                    }
                }
            };

            if (variant.Elements[1] is RichTextElement richTextElement)
            {
                var fieldHtmlBuilder = new StringBuilder();

                if (fields != null)
                {
                    foreach (var field in fields)
                    {
                        AbstractComponent? component = null;

                        switch (field.Type)
                        {
                            case Field.heading:
                                component = new HeadingComponent(field);
                                break;

                            case Field.write_text:
                                component = new WriteTextComponent(field);
                                break;

                            case Field.upload_file:
                                component = new UploadFileComponent(field);
                                break;

                            case Field.download_asset:
                                component = new DownloadAssetComponent(field);
                                break;
                        }

                        if (component != null)
                        {
                            fieldHtmlBuilder.Append($"<object type=\"application/kenticocloud\" data-type=\"component\" data-id=\"{component.Id}\"></object>");

                            richTextElement.Components.Add(component);
                        }
                    }
                }

                fieldHtmlBuilder.Append("<p><br/></p>");

                richTextElement.Value = fieldHtmlBuilder.ToString();
            }

            return variant;
        }

        public async Task PublishLanguageVariant(GetKontentParameters getKontentItemParameters)
        {
            var requestUri = ConfigureClient($"/codename/{getKontentItemParameters.Codename}/variants/codename/{coreContext.Localization ?? coreContext.DefaultLocalization}/publish");

            await PutAsJsonAsync(requestUri, null);
        }

        public async Task UnpublishLanguageVariant(GetKontentParameters getKontentItemParameters)
        {
            var requestUri = ConfigureClient($"/codename/{getKontentItemParameters.Codename}/variants/codename/{coreContext.Localization ?? coreContext.DefaultLocalization}/unpublish");

            await PutAsJsonAsync(requestUri, null);
        }

        public T ResolveItem<T>(T kontentItem, object replacementsObject, params string[] propertyNames) where T : notnull
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

        private async Task<HttpResponseMessage> PostAsJsonAsync(string requestUri, object value)
        {
            var response = await httpClient.PostAsync(requestUri, value, new JsonMediaTypeFormatter()
            {
                SerializerSettings =
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }
            });

            await ThrowIfNotSuccessStatusCode(response);

            return response;
        }

        private async Task<HttpResponseMessage> PutAsJsonAsync(string requestUri, object? value)
        {
            var response = await httpClient.PutAsync(requestUri, value, new JsonMediaTypeFormatter()
            {
                SerializerSettings =
                {
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                }
            });

            await ThrowIfNotSuccessStatusCode(response);

            return response;
        }

        private static async Task ThrowIfNotSuccessStatusCode(HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsAsync<APIErrorResponse>();
                throw errorContent.GetException();
            }
        }
    }
}