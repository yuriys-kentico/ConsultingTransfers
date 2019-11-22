using System.Collections.Generic;
using System.Threading.Tasks;

using Transfers.Models;

namespace Transfers
{
    public interface ITransfersService
    {
        Task<Transfer> CreateTransfer(CreateTransferParameters createTransferParameters);

        Task<Transfer?> GetTransfer(GetTransferParameters getTransferParameters);

        Task UpdateTransfer(UpdateTransferParameters updateTransferParameters);

        Task SuspendTransfer(GetTransferParameters getTransferParameters);

        Task ResumeTransfer(GetTransferParameters getTransferParameters);

        Task<IEnumerable<Transfer>> ListTransfers();
    }
}