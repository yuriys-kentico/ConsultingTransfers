using System.Threading.Tasks;

using Authorization.Models;

using Microsoft.AspNetCore.Http;

namespace Authorization
{
    public interface IAccessTokenValidator
    {
        Task<IAccessTokenResult> ValidateTokenAsync(HttpRequest request);
    }
}