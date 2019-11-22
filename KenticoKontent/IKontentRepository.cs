using KenticoKontent.Models;
using KenticoKontent.Models.Delivery;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace KenticoKontent
{
    public interface IKontentRepository
    {
        Task<IEnumerable<TransferItem>> GetTransfers();

        Task<T> GetKontentItem<T>(GetKontentParameters getKontentItemParameters) where T : notnull;

        Task<TransferItem> CreateTransferItem(CreateTransferItemParameters createTransferItemParameters);

        Task PublishLanguageVariant(GetKontentParameters getKontentItemParameters);

        Task UnpublishLanguageVariant(GetKontentParameters getKontentItemParameters);

        T ResolveItem<T>(T kontentItem, object replacementsObject, params string[] propertyNames) where T : notnull;
    }
}