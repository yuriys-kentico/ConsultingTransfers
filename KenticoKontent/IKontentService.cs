using System.Collections.Generic;
using System.Threading.Tasks;

using KenticoKontent.Models;
using KenticoKontent.Models.Delivery;

namespace KenticoKontent
{
    public interface IKontentService
    {
        Task<IEnumerable<TransferItem>> GetTransfers(string region);

        Task<T> GetKontentItem<T>(GetKontentParameters getKontentItemParameters);

        Task<TransferItem> CreateTransfer(CreateTransferItemParameters createTransferItemParameters);

        T ResolveItem<T>(T kontentItem, object replacementsObject, params string[] propertyNames);
    }
}