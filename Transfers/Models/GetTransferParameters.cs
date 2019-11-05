using Authorization.Models;

namespace Transfers.Models
{
    public class GetTransferParameters
    {
        public string Region { get; set; }

        public string Codename { get; set; }

        public IAccessTokenResult AccessTokenResult { get; set; }

        public void Deconstruct(out string region, out string containerName, out IAccessTokenResult accessTokenResult)
        {
            region = Region;
            containerName = Codename;
            accessTokenResult = AccessTokenResult;
        }
    }
}