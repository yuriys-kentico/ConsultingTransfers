using System.Security.Claims;

namespace Authorization.Models
{
    public sealed class AccessTokenResult
    {
        public ClaimsPrincipal Principal { get; private set; }

        public AccessTokenStatus Status { get; private set; }

        private AccessTokenResult(AccessTokenStatus status, ClaimsPrincipal principal = null)
        {
            Status = status;
            Principal = principal;
        }

        /// <summary>
        /// Returns a valid result.
        /// </summary>
        public static AccessTokenResult Valid(ClaimsPrincipal principal) => new AccessTokenResult(AccessTokenStatus.Valid, principal);

        /// <summary>
        /// Returns an expired result.
        /// </summary>
        public static AccessTokenResult Expired() => new AccessTokenResult(AccessTokenStatus.Expired);

        /// <summary>
        /// Returns a result with no token in the request.
        /// </summary>
        public static AccessTokenResult NoToken() => new AccessTokenResult(AccessTokenStatus.NoToken);
    }
}