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
        private const string Authorization = nameof(Authorization);
        private const string BearerSpace = "Bearer ";

        private readonly ConfigurationManager<OpenIdConnectConfiguration> configManager;
        private readonly TokenValidationParameters tokenValidationParameters;

        private static string AuthorizationMetadataAddress => CoreHelper.GetSetting<string>("Authorization", "MetadataAddress");

        private static string AuthorizationAudiences => CoreHelper.GetSetting<string>("Authorization", "Audiences");

        private static string AuthorizationIssuer => CoreHelper.GetSetting<string>("Authorization", "Issuer");

        public AccessTokenValidator()
        {
            configManager = new ConfigurationManager<OpenIdConnectConfiguration>(AuthorizationMetadataAddress, new OpenIdConnectConfigurationRetriever());

            tokenValidationParameters = new TokenValidationParameters
            {
                ValidAudiences = AuthorizationAudiences?.Split(';'),
                ValidIssuer = AuthorizationIssuer,
                ValidateIssuerSigningKey = true
            };
        }

        public async Task<IAccessTokenResult> ValidateToken(IDictionary<string, string> headers)
        {
            try
            {
                if (headers.TryGetValue(Authorization, out var accessToken) && accessToken.StartsWith(BearerSpace))
                {
                    var accessTokenValue = accessToken.Substring(BearerSpace.Length);

                    var config = await configManager.GetConfigurationAsync();

                    tokenValidationParameters.IssuerSigningKeys = config.SigningKeys;

                    var result = new JwtSecurityTokenHandler()
                        .ValidateToken(accessTokenValue, tokenValidationParameters, out _);

                    return new ValidAccessTokenResult(result);
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