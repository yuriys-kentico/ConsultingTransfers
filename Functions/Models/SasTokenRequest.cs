using Microsoft.Azure.Storage;
using Microsoft.Azure.Storage.Blob;

namespace Functions.Models
{
    public class SasTokenRequest
    {
        public string AccountName { get; set; }

        public SharedAccessAccountPermissions AccountPermissions { get; set; }

        public string ContainerToken { get; set; }

        public SharedAccessBlobPermissions ContainerPermissions { get; set; }

        public void Deconstruct(
            out string accountName,
            out SharedAccessAccountPermissions accountPermissions,
            out string containerToken,
            out SharedAccessBlobPermissions containerPermissions
            )
        {
            accountName = AccountName;
            accountPermissions = AccountPermissions;
            containerToken = ContainerToken;
            containerPermissions = ContainerPermissions;
        }
    }
}