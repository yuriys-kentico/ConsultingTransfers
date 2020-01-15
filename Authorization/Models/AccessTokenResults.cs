using System.Runtime.CompilerServices;
using System.Security.Claims;

// Required for tests
[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]

namespace Authorization.Models
{
    public interface IAccessTokenResult
    {
    }

    public class NoAccessTokenResult : IAccessTokenResult
    {
        internal NoAccessTokenResult()
        {
        }
    }

    public class ExpiredAccessTokenResult : IAccessTokenResult
    {
        internal ExpiredAccessTokenResult()
        {
        }
    }

    public class ValidAccessTokenResult : IAccessTokenResult
    {
        public ClaimsPrincipal? Principal { get; }

        internal ValidAccessTokenResult(ClaimsPrincipal? principal)
        {
            Principal = principal;
        }

        // Required for tests
        internal ValidAccessTokenResult()
        {
        }
    }
}