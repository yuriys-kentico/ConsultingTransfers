using Authorization;

using AzureStorage;

using Core;

using Encryption;

using Functions;

using KenticoKontent;

using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Logging;

using Teams;

using Transfers;

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
            var metadataAddress = CoreHelper.GetSetting("authorization", "metadataAddress");
            var audiences = CoreHelper.GetSetting("authorization", "audiences");
            var issuer = CoreHelper.GetSetting("authorization", "issuer");
            var tokenSecret = CoreHelper.GetSetting("tokenSecret");
            var detailsKey = CoreHelper.GetSetting("detailsKey");

            functionsHostBuilder.Services
                .AddHttpClient<ITeamsService, TeamsService>();

            functionsHostBuilder.Services
                .AddTransient<IAccessTokenValidator>(_ => new AccessTokenValidator(metadataAddress, audiences, issuer, detailsKey))
                .AddTransient<IWebhookValidator>(_ => new WebhookValidator())
                .AddSingleton<IEncryptionService>(new EncryptionService(tokenSecret))
                .AddSingleton<IStorageService>(services => new StorageService(
                    services.GetRequiredService<IEncryptionService>()))
                .AddSingleton<ITransfersService>(services => new TransfersService(
                    services.GetRequiredService<IEncryptionService>(),
                    services.GetRequiredService<IKontentService>(),
                    services.GetRequiredService<IStorageService>(),
                    services.GetRequiredService<ITeamsService>()))
                .AddHttpClient<IKontentService, KontentService>();

            //IdentityModelEventSource.ShowPII = true;
        }
    }
}