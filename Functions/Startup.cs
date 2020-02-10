using Authorization;

using AzureStorage;

using Core;

using Encryption;

using Functions;

using KenticoKontent;

using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MicrosoftTeams;

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
            var configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .Build();

            var settings = new Settings();

            ConfigurationBinder.Bind(configuration, settings);

            functionsHostBuilder.Services
                .AddHttpClient<ITeamsService, TeamsService>();

            functionsHostBuilder.Services
                .AddSingleton(_ => settings)
                .AddSingleton<ICoreContext, CoreContext>()
                .AddSingleton<IEncryptionService, EncryptionService>()
                .AddSingleton<IStorageRepository, StorageRepository>()
                .AddSingleton<ITransfersService, TransfersService>()
                .AddTransient<IAccessTokenValidator, AccessTokenValidator>()
                .AddTransient<IWebhookValidator, WebhookValidator>()
                .AddHttpClient<IKontentRepository, KontentRepository>();
        }
    }
}