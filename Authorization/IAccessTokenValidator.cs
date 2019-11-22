using Authorization.Models;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace Authorization
{
    public interface IAccessTokenValidator
    {
        Task<IAccessTokenResult> ValidateToken(IDictionary<string, string> headers);
    }
}