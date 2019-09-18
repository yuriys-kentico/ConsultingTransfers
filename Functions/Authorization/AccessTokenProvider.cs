﻿using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace Functions.Authorization
{
    /// <summary>
    /// Validates a incoming request and extracts any <see cref="ClaimsPrincipal"/> contained within the bearer token.
    /// </summary>
    public class AccessTokenProvider : IAccessTokenProvider
    {
        private const string Authorization = "Authorization";
        private const string BearerSpace = "Bearer ";

        private readonly ConfigurationManager<OpenIdConnectConfiguration> configManager;
        private readonly TokenValidationParameters tokenValidationParameters;

        public AccessTokenProvider(string metadataAddress, string audiences, string issuer)
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
        }

        public async Task<AccessTokenResult> ValidateTokenAsync(HttpRequest request)
        {
            try
            {
                if (request.Headers.TryGetValue(Authorization, out var bearerToken) && bearerToken.ToString().StartsWith(BearerSpace))
                {
                    var config = await configManager.GetConfigurationAsync().ConfigureAwait(false);

                    tokenValidationParameters.IssuerSigningKeys = config.SigningKeys;

                    var result = new JwtSecurityTokenHandler()
                        .ValidateToken(bearerToken.ToString().Substring(BearerSpace.Length), tokenValidationParameters, out _);

                    return AccessTokenResult.Success(result);
                }

                return AccessTokenResult.NoToken();
            }
            catch (SecurityTokenExpiredException)
            {
                return AccessTokenResult.Expired();
            }
            catch (Exception ex)
            {
                return AccessTokenResult.Error(ex);
            }
        }
    }
}