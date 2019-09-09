using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

using Newtonsoft.Json;

public static class AzureStorageContainerCreator
{
    public class WebhookModel
    {
        public Message Message { get; set; }

        public Data Data { get; set; }
    }

    public class Message
    {
        public Guid Id { get; set; }

        public string Type { get; set; }

        public string Operation { get; set; }

        [JsonProperty("api_name")]
        public string ApiName { get; set; }

        [JsonProperty("project_id")]
        public Guid ProjectId { get; set; }
    }

    public class Data
    {
        public Item[] Items { get; set; }

        public Taxonomy[] Taxonomies { get; set; }
    }

    public class Item
    {
        public string Language { get; set; }

        public string Type { get; set; }

        public string Codename { get; set; }
    }

    public class Taxonomy
    {
        public string Codename { get; set; }
    }

    [FunctionName(nameof(AzureStorageContainerCreator))]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
        ILogger log
        )
    {
        using (var reader = new StreamReader(request.Body, Encoding.UTF8, true, 1024, true))
        {
            var requestBody = await reader.ReadToEndAsync();

            try
            {
                request.Headers.TryGetValue("X-Kc-Signature", out var signatureFromRequest);

                var secret = Environment.GetEnvironmentVariable("webhookSecret", EnvironmentVariableTarget.Process);
                var generatedSignature = GenerateHash(requestBody, secret);

                if (generatedSignature != signatureFromRequest)
                {
                    return new UnauthorizedResult();
                }
                else
                {
                    var model = JsonConvert.DeserializeObject<WebhookModel>(requestBody);

                    var storageConnectionString = Environment.GetEnvironmentVariable(
                        request.Query["accountName"],
                        EnvironmentVariableTarget.Process
                        );
                    var storageAccount = CloudStorageAccount.Parse(storageConnectionString);
                    var blobClient = storageAccount.CreateCloudBlobClient();

                    foreach (var item in model.Data.Items)
                    {
                        var containerName = GetSafeStorageName(item.Codename);
                        var container = blobClient.GetContainerReference(containerName);

                        await container.CreateIfNotExistsAsync();
                    }

                    return new OkResult();
                }
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex.ToString());
            }
        }
    }

    public static string GenerateHash(string content, string secret)
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

    public static string GetSafeStorageName(string itemCodeName)
    {
        return itemCodeName.Replace("_", "");
    }
}