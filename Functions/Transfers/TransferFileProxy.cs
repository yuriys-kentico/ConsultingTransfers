using Authorization;

using Core;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

using System;
using System.Collections.Generic;
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

        private static IEnumerable<string> AzureStorageAllowedExtensions => CoreHelper.GetSetting<string>("AzureStorage", "AllowedExtensions")
            .Split(';', StringSplitOptions.RemoveEmptyEntries);

        private string RegionFileEndpointStorage => CoreHelper.GetSetting<string>(coreContext.Region, "FileEndpoint", "Storage");

        private string RegionFileEndpoint => CoreHelper.GetSetting<string>(coreContext.Region, "FileEndpoint");

        public TransferFileProxy(
            ILogger<TransferFileProxy> logger,
            IAccessTokenValidator accessTokenValidator,
            ICoreContext coreContext,
            HttpClient httpClient
            ) : base(logger)
        {
            this.accessTokenValidator = accessTokenValidator;
            this.coreContext = coreContext;
            this.httpClient = httpClient;
        }

        [FunctionName(nameof(TransferFileProxy))]
        public async Task<IActionResult> Run(
                [HttpTrigger(
                    AuthorizationLevel.Anonymous,
                    "put", "get",
                    Route = transfers + "/{region:alpha:length(2)}/{*storagePath}"
                )] HttpRequest request,
                string region,
                string storagePath
                )
        {
            try
            {
                coreContext.Region = region;

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

            requestMessage.Headers.Host = requestUri.Host;

            return requestMessage;
        }

        private Uri GetRequestUri(string storagePath, QueryString queryString)
        {
            if (storagePath.Contains('.') && AzureStorageAllowedExtensions.Any(extension => storagePath.EndsWith(extension))
                || !storagePath.Contains('.'))
            {
                return new Uri($"{RegionFileEndpointStorage}/{storagePath}{queryString}");
            }

            throw new ProxyException($"Path '{RegionFileEndpoint}/{storagePath}' is not valid.");
        }

        private static HttpMethod GetMethod(string method)
        {
            return method switch
            {
                _ when HttpMethods.IsPut(method) => HttpMethod.Put,
                _ when HttpMethods.IsGet(method) => HttpMethod.Get,
                _ => throw new InvalidOperationException($"Method '{method}' is not PUT or GET.")
            };
        }
    }
}