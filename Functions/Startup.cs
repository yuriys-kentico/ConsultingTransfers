using Authorization;

using AzureStorage;

using Core;

using Encryption;

using Functions;

using KenticoKontent;

using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Functions
{
    /// <summary>
    /// Runs when the Azure Functions host starts.
    /// </summary>
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder functionsHostBuilder)
        {
            var metadataAddress = AzureFunctionHelper.GetSetting("authorization", "metadataAddress");
            var audiences = AzureFunctionHelper.GetSetting("authorization", "audiences");
            var issuer = AzureFunctionHelper.GetSetting("authorization", "issuer");
            var tokenSecret = AzureFunctionHelper.GetSetting("tokenSecret");
            var detailsKey = AzureFunctionHelper.GetSetting("detailsKey");

            functionsHostBuilder.Services
                .AddTransient<IAccessTokenValidator>(_ => new AccessTokenValidator(metadataAddress, audiences, issuer, detailsKey))
                .AddSingleton<IStorageService>(new StorageService())
                .AddSingleton<IEncryptionService>(new EncryptionService(tokenSecret))
                .AddTransient<IWebhookValidator>(_ => new WebhookValidator());
        }
    }
}