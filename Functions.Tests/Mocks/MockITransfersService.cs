using Authorization.Models;

using Moq;

using System;
using System.Linq.Expressions;
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
            mockTransfersService
                .Setup(mock => mock
                    .GetTransfer(
                        It.Is<GetTransferParameters>(
                            getTransferParameters => GetValidGetTransferParameters(getTransferParameters, accessTokenResult)
                        )
                    )
                )
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
                GetValidGetTransferParameters(getTransferParameters))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.SuspendTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                !GetValidGetTransferParameters(getTransferParameters))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupResumeTransfer(
            this Mock<ITransfersService> mockTransfersService
            )
        {
            mockTransfersService.Setup(mock => mock.ResumeTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                GetValidGetTransferParameters(getTransferParameters))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.ResumeTransfer(It.Is<GetTransferParameters>(getTransferParameters =>
                !GetValidGetTransferParameters(getTransferParameters))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupUpdateTransfer(
            this Mock<ITransfersService> mockTransfersService
            )
        {
            mockTransfersService.Setup(mock => mock.UpdateTransfer(It.Is<UpdateTransferParameters>(updateTransferParameters =>
                GetValidUpdateTransferParameters(updateTransferParameters))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.UpdateTransfer(It.Is<UpdateTransferParameters>(updateTransferParameters =>
                !GetValidUpdateTransferParameters(updateTransferParameters))))
                .Returns(Task.CompletedTask);
        }

        internal static void SetupCreateTransfer(
            this Mock<ITransfersService> mockTransfersService,
            Transfer transfer
            )
        {
            mockTransfersService.Setup(mock => mock.CreateTransfer(It.Is<CreateTransferParameters>(createTransferParameters =>
                GetValidCreateTransferParameters(createTransferParameters))))
                .Throws<Exception>();

            mockTransfersService.Setup(mock => mock.CreateTransfer(It.IsAny<CreateTransferParameters>()))
                .ReturnsAsync(transfer);
        }

        private static bool GetValidGetTransferParameters(
            GetTransferParameters getTransferParameters,
            IAccessTokenResult accessTokenResult
            )
        {
            var (_, files, fields, containerUrl, _) = getTransferParameters;

            return (files, fields, containerUrl, accessTokenResult)
            switch
            {
                (false, true, true, _) when accessTokenResult is NoAccessTokenResult => true,
                (false, true, true, _) when accessTokenResult is ValidAccessTokenResult => true,
                (true, false, false, _) when accessTokenResult is ValidAccessTokenResult => true,
                _ => false
            };
        }

        private static bool GetValidGetTransferParameters(
            GetTransferParameters getTransferParameters
            )
        {
            var (transferToken, _, _, _, _) = getTransferParameters;

            return string.IsNullOrEmpty(transferToken);
        }

        private static bool GetValidUpdateTransferParameters(
            UpdateTransferParameters updateTransferParameters
            )
        {
            var (transferToken, _, _, _) = updateTransferParameters;

            return string.IsNullOrEmpty(transferToken);
        }

        private static bool GetValidCreateTransferParameters(
            CreateTransferParameters createTransferParameters
            )
        {
            var (name, customer, requester, _) = createTransferParameters;

            return string.IsNullOrEmpty(name)
                || string.IsNullOrEmpty(customer)
                || string.IsNullOrEmpty(requester);
        }
    }
}