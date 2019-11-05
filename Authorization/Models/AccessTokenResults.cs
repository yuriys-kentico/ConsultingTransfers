using System.Security.Claims;

namespace Authorization.Models
{
    public interface IAccessTokenResult
    {
    }

    public sealed class NoAccessTokenResult : IAccessTokenResult
    {
        internal NoAccessTokenResult()
        {
        }
    }

    public sealed class ExpiredAccessTokenResult : IAccessTokenResult
    {
        internal ExpiredAccessTokenResult()
        {
        }
    }

    public sealed class ValidAccessTokenResult : IAccessTokenResult
    {
        public ClaimsPrincipal Principal { get; }

        internal ValidAccessTokenResult(ClaimsPrincipal principal)
        {
            Principal = principal;
        }
    }
}