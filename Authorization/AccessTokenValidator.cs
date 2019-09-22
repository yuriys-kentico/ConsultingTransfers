using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

using Authorization.Models;

using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace Authorization
{
    /// <summary>
    /// Validates a incoming request and extracts any <see cref="ClaimsPrincipal"/> contained within the bearer token.
    /// </summary>
    public class AccessTokenValidator : IAccessTokenValidator
    {
        private const string Authorization = "Authorization";
        private const string BearerSpace = "Bearer ";

        private readonly ConfigurationManager<OpenIdConnectConfiguration> configManager;
        private readonly TokenValidationParameters tokenValidationParameters;
        private readonly string detailsKey;

        public AccessTokenValidator(string metadataAddress, string audiences, string issuer, string detailsKey)
        {
            configManager = new ConfigurationManager<OpenIdConnectConfiguration>(metadataAddress, new OpenIdConnectConfigurationRetriever());

            tokenValidationParameters = new TokenValidationParameters
            {
                RequireSignedTokens = true,
                ValidAudiences = audiences.Split(';'),
                ValidateAudience = true,
                ValidIssuer = issuer,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true
            };

            this.detailsKey = detailsKey;
        }

        public async Task<IAccessTokenResult> ValidateTokenAsync(HttpRequest request)
        {
            try
            {
                if (request.Headers.TryGetValue(Authorization, out var bearerToken) && bearerToken.ToString().StartsWith(BearerSpace))
                {
                    // TODO: Pending MSAL in iframe: https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/899
                    if (bearerToken.ToString().Substring(BearerSpace.Length) == detailsKey)
                        return new ValidAccessTokenResult(null);

                    var config = await configManager.GetConfigurationAsync().ConfigureAwait(false);

                    tokenValidationParameters.IssuerSigningKeys = config.SigningKeys;

                    var result = new JwtSecurityTokenHandler()
                        .ValidateToken(bearerToken.ToString().Substring(BearerSpace.Length), tokenValidationParameters, out _);

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