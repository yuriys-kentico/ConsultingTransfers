using System.Security.Claims;

namespace Authorization.Models
{
    public sealed class AccessTokenResult
    {
        private AccessTokenResult()
        {
        }

        public ClaimsPrincipal Principal { get; private set; }

        public AccessTokenStatus Status { get; private set; }

        /// <summary>
        /// Returns a valid token.
        /// </summary>
        public static AccessTokenResult Success(ClaimsPrincipal principal)
        {
            return new AccessTokenResult
            {
                Principal = principal,
                Status = AccessTokenStatus.Valid
            };
        }

        /// <summary>
        /// Returns a result that indicates the submitted token has expired.
        /// </summary>
        public static AccessTokenResult Expired()
        {
            return new AccessTokenResult
            {
                Status = AccessTokenStatus.Expired
            };
        }

        /// <summary>
        /// Returns a result in response to no token being in the request.
        /// </summary>
        /// <returns></returns>
        public static AccessTokenResult NoToken()
        {
            return new AccessTokenResult
            {
                Status = AccessTokenStatus.NoToken
            };
        }
    }
}