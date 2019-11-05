using System.Collections.Generic;
using System.Threading.Tasks;

using Encryption.Models;

using Transfers.Models;

namespace Transfers
{
    public interface ITransfersService
    {
        TransferToken DecryptTransferToken(string transferToken);

        Task<Transfer> CreateTransfer(CreateTransferParameters createTransferParameters);

        Task<Transfer> GetTransferForClient(GetTransferParameters getTransferParameters);

        Task<Transfer> GetTransfer(GetTransferParameters getTransferParameters);

        Task UpdateTransfer(UpdateTransferParameters updateTransferParameters);

        Task<IEnumerable<Transfer>> ListTransfers(string region);
    }
}