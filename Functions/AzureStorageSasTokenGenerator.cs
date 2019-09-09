using System;
using System.IO;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

using Newtonsoft.Json;

public class SasTokenRequest
{
    public string AccountName { get; set; }

    public SharedAccessAccountPermissions AccountPermissions { get; set; }

    public string ContainerName { get; set; }

    public SharedAccessBlobPermissions ContainerPermissions { get; set; }

    public void Deconstruct(
        out string accountName,
        out SharedAccessAccountPermissions accountPermissions,
        out string containerName,
        out SharedAccessBlobPermissions containerPermissions
        )
    {
        accountName = AccountName;
        accountPermissions = AccountPermissions;
        containerName = ContainerName;
        containerPermissions = ContainerPermissions;
    }
}

public static class AzureStorageSasTokenGenerator
{
    [FunctionName(nameof(AzureStorageSasTokenGenerator))]
    public static async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequest request,
        ILogger log
        )
    {
        string sasToken;

        using (var reader = new StreamReader(request.Body))
        {
            var requestBody = await reader.ReadToEndAsync();

            try
            {
                var (accountName, accountPermissions, containerName, containerPermissions)
                    = JsonConvert.DeserializeObject<SasTokenRequest>(requestBody);

                var storageConnectionString = Environment.GetEnvironmentVariable(accountName, EnvironmentVariableTarget.Process);
                var storageAccount = CloudStorageAccount.Parse(storageConnectionString);

                if (!string.IsNullOrEmpty(containerName))
                {
                    var blobClient = storageAccount.CreateCloudBlobClient();
                    var container = blobClient.GetContainerReference(containerName);

                    sasToken = GetContainerSasToken(container, containerPermissions);
                }
                else
                {
                    sasToken = GetAccountSasToken(storageAccount, accountPermissions);
                }
            }
            catch (Exception ex)
            {
                return new BadRequestObjectResult(ex.ToString());
            }
        }

        return new OkObjectResult(sasToken);
    }

    private static string GetAccountSasToken(CloudStorageAccount storageAccount, SharedAccessAccountPermissions permissions)
    {
        var policy = new SharedAccessAccountPolicy
        {
            Permissions = permissions,
            Services = SharedAccessAccountServices.Blob,
            ResourceTypes = SharedAccessAccountResourceTypes.Container | SharedAccessAccountResourceTypes.Object,
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
            Protocols = SharedAccessProtocol.HttpsOnly
        };

        return storageAccount.GetSharedAccessSignature(policy);
    }

    public static string GetContainerSasToken(CloudBlobContainer container, SharedAccessBlobPermissions permissions)
    {
        // The SharedAccessBlobPolicy class is saved to the container's shared access policies
        var policy = new SharedAccessBlobPolicy
        {
            // Set start time to five minutes before now to avoid clock skew.
            SharedAccessStartTime = DateTime.UtcNow.AddMinutes(-5),
            SharedAccessExpiryTime = DateTime.UtcNow.AddHours(12),
            Permissions = permissions
        };

        return container.GetSharedAccessSignature(policy, null);
    }
}