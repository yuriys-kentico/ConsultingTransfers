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
            this Mock<ITransfersService> mockTransfersService,
            bool throws = false
            )
        {
            var setup = mockTransfersService.Setup(mock => mock.SuspendTransfer(It.IsAny<GetTransferParameters>()));

            if (throws)
            {
                setup.Throws<Exception>();
            }
            else
            {
                setup.Returns(Task.CompletedTask);
            }
        }

        internal static void SetupResumeTransfer(
            this Mock<ITransfersService> mockTransfersService,
            bool throws = false
            )
        {
            var setup = mockTransfersService.Setup(mock => mock.ResumeTransfer(It.IsAny<GetTransferParameters>()));

            if (throws)
            {
                setup.Throws<Exception>();
            }
            else
            {
                setup.Returns(Task.CompletedTask);
            }
        }

        internal static void SetupUpdateTransfer(
            this Mock<ITransfersService> mockTransfersService,
            bool throws = false
            )
        {
            var setup = mockTransfersService.Setup(mock => mock.UpdateTransfer(It.IsAny<UpdateTransferParameters>()));

            if (throws)
            {
                setup.Throws<Exception>();
            }
            else
            {
                setup.Returns(Task.CompletedTask);
            }
        }

        internal static void SetupCreateTransfer(
            this Mock<ITransfersService> mockTransfersService,
            Transfer transfer,
            bool throws = false
            )
        {
            var setup = mockTransfersService.Setup(mock => mock.CreateTransfer(It.IsAny<CreateTransferParameters>()));

            if (throws)
            {
                setup.Throws<Exception>();
            }
            else
            {
                setup.ReturnsAsync(transfer);
            }
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
    }
}