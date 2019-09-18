﻿using Functions;
using Functions.Authorization;

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
            var metadataAddress = AzureFunctionHelper.GetEnvironmentVariable("authorization", "metadataAddress");
            var audiences = AzureFunctionHelper.GetEnvironmentVariable("authorization", "audiences");
            var issuer = AzureFunctionHelper.GetEnvironmentVariable("authorization", "issuer");
            var tokenSecret = AzureFunctionHelper.GetEnvironmentVariable("tokenSecret");

            functionsHostBuilder.Services
                .AddSingleton<IAccessTokenValidator>(new AccessTokenValidator(metadataAddress, audiences, issuer))
                .AddSingleton<IEncryptionService>(new EncryptionService(tokenSecret));
        }
    }
}