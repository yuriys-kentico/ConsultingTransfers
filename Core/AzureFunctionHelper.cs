using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

namespace Core
{
    public static class AzureFunctionHelper
    {
        public static async Task<string> GetBodyAsync(HttpRequest request)
        {
            request.EnableBuffering();

            using (var reader = new StreamReader(request.Body, Encoding.UTF8, true, 1024, true))
            {
                string requestBody = null;

                requestBody = await reader.ReadToEndAsync();
                request.Body.Seek(0, SeekOrigin.Begin);

                return requestBody;
            }
        }

        public static async Task<T> GetPayloadAsync<T>(HttpRequest request)
        {
            string requestBody = await GetBodyAsync(request);

            return JsonConvert.DeserializeObject<T>(requestBody);
        }

        public static string GetSetting(params string[] settingParts)
        {
            var key = string.Join(':', settingParts);

            return Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
        }

        public static NotFoundResult LogException(HttpRequest request, ILogger log, Exception ex)
        {
            var displayUrl = request.GetDisplayUrl();

            log.LogError(ex, "Request: {displayUrl}", displayUrl);

            return new NotFoundResult();
        }
    }
}