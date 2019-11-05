using System.Collections.Generic;
using System.Threading.Tasks;

using Authorization.Models;

namespace Authorization
{
    public interface IAccessTokenValidator
    {
        Task<IAccessTokenResult> ValidateTokenAsync(IDictionary<string, string> headers);
    }
}