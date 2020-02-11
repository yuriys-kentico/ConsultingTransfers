using Authorization.Models;

using Core;

using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;

namespace Authorization
{
    public class AccessTokenValidator : IAccessTokenValidator
    {
        private readonly ConfigurationManager<OpenIdConnectConfiguration> configManager;
        private readonly TokenValidationParameters tokenValidationParameters;

        public AccessTokenValidator(
                Settings settings
            )
        {
            configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                settings.Authorization.MetadataAddress,
                new OpenIdConnectConfigurationRetriever()
                );

            tokenValidationParameters = new TokenValidationParameters
            {
                ValidAudiences = settings.Authorization.Audiences?.Split(';'),
                ValidIssuer = settings.Authorization.Issuer,
                ValidateIssuerSigningKey = true
            };
        }

        public async Task<IAccessTokenResult> ValidateToken(IDictionary<string, string> headers)
        {
            const string bearerSpace = "Bearer ";

            try
            {
                if (headers.TryGetValue("Authorization", out var accessToken) && accessToken.StartsWith(bearerSpace))
                {
                    var accessTokenValue = accessToken.Substring(bearerSpace.Length);

                    var config = await configManager.GetConfigurationAsync();

                    tokenValidationParameters.IssuerSigningKeys = config.SigningKeys;

                    var result = new JwtSecurityTokenHandler()
                        .ValidateToken(accessTokenValue, tokenValidationParameters, out _);

                    return new ValidAccessTokenResult
                    {
                        Principal = result
                    };
                }

                return new NoAccessTokenResult();
            }
            catch (SecurityTokenExpiredException)
            {
                return new ExpiredAccessTokenResult();
            }
            catch
            {
                throw;
            }
        }
    }
}