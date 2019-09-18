﻿namespace Functions.Authorization
{
    using System.Threading.Tasks;

    using Microsoft.AspNetCore.Http;

    /// <summary>
    /// Validates access tokes that have been submitted as part of a request.
    /// </summary>
    public interface IAccessTokenValidator
    {
        /// <summary>
        /// Validate the access token, returning the security principal in a result.
        /// </summary>
        /// <param name="request">The HTTP request containing the access token.</param>
        /// <returns>A result that contains the security principal.</returns>
        Task<AccessTokenResult> ValidateTokenAsync(HttpRequest request);
    }
}