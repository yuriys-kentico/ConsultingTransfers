using Authorization.Models;

using Moq;

using System;
using System.Threading.Tasks;

using Transfers;
using Transfers.Models;

namespace Functions.Tests.Mocks
{
    internal static class MockITransfersService
    {
        internal static Mock<ITransfersService> Get()
        {
            var mock = new Mock<ITransfersService>(MockBehavior.Strict);

            return mock;
        }

        internal static void SetupGetTransfer(
            this Mock<ITransfersService> mockTransfersService,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockTransfersService.Setup(mock => mock.GetTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                getTransferParameters.ContainerUrl == true
                && getTransferParameters.Fields == true
                && getTransferParameters.Files == false
                && accessTokenResult is ValidAccessTokenResult
                || getTransferParameters.ContainerUrl == true
                && getTransferParameters.Fields == true
                && getTransferParameters.Files == false
                && accessTokenResult is NoAccessTokenResult
                || getTransferParameters.ContainerUrl == false
                && getTransferParameters.Fields == false
                && getTransferParameters.Files == true
                && accessTokenResult is ValidAccessTokenResult
            )))
                .ReturnsAsync(transfer);
        }

        internal static void SetupListTransfers(
            this Mock<ITransfersService> mockTransfersService,
            Transfer transfer
            )
        {
            mockTransfersService.Setup(mock => mock.ListTransfers())
                .ReturnsAsync(new[] { transfer });
        }

        internal static void SetupSuspendTransfer(
            this Mock<ITransfersService> mockTransfersService
            )
        {
            mockTransfersService.Setup(mock => mock.SuspendTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                string.IsNullOrEmpty(getTransferParameters.TransferToken))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.SuspendTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                !string.IsNullOrEmpty(getTransferParameters.TransferToken))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupResumeTransfer(
            this Mock<ITransfersService> mockTransfersService
            )
        {
            mockTransfersService.Setup(mock => mock.ResumeTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                string.IsNullOrEmpty(getTransferParameters.TransferToken))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.ResumeTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                !string.IsNullOrEmpty(getTransferParameters.TransferToken))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupUpdateTransfer(
            this Mock<ITransfersService> mockTransfersService
            )
        {
            mockTransfersService.Setup(mock => mock.UpdateTransfer(It.Is<UpdateTransferParameters>(updateTransferParameters =>
                string.IsNullOrEmpty(updateTransferParameters.TransferToken))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.UpdateTransfer(It.Is<UpdateTransferParameters>(updateTransferParameters =>
                !string.IsNullOrEmpty(updateTransferParameters.TransferToken))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupCreateTransfer(
            this Mock<ITransfersService> mockTransfersService,
            Transfer transfer
            )
        {
            mockTransfersService.Setup(mock => mock.CreateTransfer(It.Is<CreateTransferParameters>(createTransferParameters =>
                string.IsNullOrEmpty(createTransferParameters.Name)
                || string.IsNullOrEmpty(createTransferParameters.Customer)
                || string.IsNullOrEmpty(createTransferParameters.Requester))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.CreateTransfer(It.IsAny<CreateTransferParameters>()))
                .ReturnsAsync(transfer);
        }
    }
}