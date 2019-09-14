using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;

using Newtonsoft.Json;

namespace Functions.RequestCreator
{
    public static class Function
    {
        [FunctionName(nameof(RequestCreator))]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
            ILogger log
            )
        {
            string requestBody = await request.ReadAsStringAsync();

            try
            {
                request.Headers.TryGetValue("X-Kc-Signature", out var signatureFromRequest);

                var secret = AzureFunctionHelper.GetEnvironmentVariable(request.Query["accountName"], "webhookSecret");
                var generatedSignature = GetHashForWebhook(requestBody, secret);

                if (generatedSignature != signatureFromRequest)
                {
                    return new UnauthorizedResult();
                }

                var webhook = JsonConvert.DeserializeObject<Webhook>(requestBody);
                var storageConnectionString = AzureFunctionHelper.GetEnvironmentVariable(request.Query["accountName"]);

                await CreateContainers(webhook, storageConnectionString);

                return new OkResult();
            }
            catch (Exception ex)
            {
                return new ExceptionResult(ex, true);
            }
        }

        private static async Task CreateContainers(Webhook webhook, string storageConnectionString)
        {
            var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
            var blobClient = storageAccount.CreateCloudBlobClient();

            foreach (var item in webhook.Data.Items)
            {
                var containerName = AzureStorageHelper.GetSafeStorageName(item.Codename);
                var container = blobClient.GetContainerReference(containerName);

                var created = await container.CreateIfNotExistsAsync();

                container.Metadata.Add("ContainerToken", AzureStorageHelper.EncryptToken(item.Codename));

                await container.SetMetadataAsync();
            }
        }

        public static string GetHashForWebhook(string content, string secret)
        {
            var safeUTF8 = new UTF8Encoding(false, true);
            byte[] keyBytes = safeUTF8.GetBytes(secret);
            byte[] messageBytes = safeUTF8.GetBytes(content);

            using (var hmacsha256 = new HMACSHA256(keyBytes))
            {
                byte[] hashMessage = hmacsha256.ComputeHash(messageBytes);

                return Convert.ToBase64String(hashMessage);
            }
        }
    }
}