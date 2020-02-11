using Authorization;

using Core;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Functions.Transfers
{
    public class TransferFileProxy : BaseFunction
    {
        private readonly IAccessTokenValidator accessTokenValidator;
        private readonly ICoreContext coreContext;
        private readonly HttpClient httpClient;
        private readonly Settings settings;

        public TransferFileProxy(
            ILogger<TransferFileProxy> logger,
            IAccessTokenValidator accessTokenValidator,
            ICoreContext coreContext,
            HttpClient httpClient,
            Settings settings
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.coreContext = coreContext;
            this.httpClient = httpClient;
            this.settings = settings;
        }

        [FunctionName(nameof(TransferFileProxy))]
        public async Task<IActionResult> Run(
                [HttpTrigger(
                    AuthorizationLevel.Anonymous,
                    "put", "get", "delete",
                    Route = Routes.TransferFileProxy
                )] HttpRequest request,
                string region,
                string storagePath
                )
        {
            try
            {
                coreContext.SetRegion(region);

                var requestMessage = GetRequestMessage(request, storagePath);

                var responseMessage = await httpClient.SendAsync(requestMessage, HttpCompletionOption.ResponseContentRead);

                return new ProxyResult(responseMessage);
            }
            catch (ProxyException ex)
            {
                return LogBadRequest(ex);
            }
            catch (Exception ex)
            {
                return LogException(ex);
            }
        }

        private HttpRequestMessage GetRequestMessage(HttpRequest request, string storagePath)
        {
            var requestUri = GetRequestUri(storagePath, request.QueryString);

            var requestMessage = new HttpRequestMessage
            {
                Content = new StreamContent(request.Body),
                RequestUri = requestUri,
                Method = GetMethod(request.Method)
            };

            foreach (var header in request.Headers)
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }

            requestMessage.Headers.Host = requestUri.Host;

            return requestMessage;
        }

        private Uri GetRequestUri(string storagePath, QueryString queryString)
        {
            if (storagePath.Contains('.') && settings.AzureStorage.AllowedExtensions
                    .Split(';', StringSplitOptions.RemoveEmptyEntries)
                    .Any(extension => storagePath.EndsWith(extension))
                || !storagePath.Contains('.'))
            {
                return new Uri($"{coreContext.Region.StorageEndpoint}/{storagePath}{queryString}");
            }

            throw new ProxyException($"Path '{coreContext.Region.FileEndpoint}/{storagePath}' is not valid.");
        }

        private static HttpMethod GetMethod(string method)
        {
            return method switch
            {
                _ when HttpMethods.IsPut(method) => HttpMethod.Put,
                _ when HttpMethods.IsGet(method) => HttpMethod.Get,
                _ when HttpMethods.IsDelete(method) => HttpMethod.Delete,
                _ => throw new InvalidOperationException($"Method '{method}' is not valid.")
            };
        }
    }
}