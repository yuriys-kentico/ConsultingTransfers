using Authorization.Models;

using Functions.Models;
using Functions.Tests.Mocks;
using Functions.Transfers;

using Microsoft.AspNetCore.Mvc;

using Moq;

using NUnit.Framework;

using System.Collections.Generic;
using System.Threading.Tasks;

using Transfers.Models;

namespace Functions.Tests.Transfers
{
    public class GetTransferTests : BaseFunctionTests<GetTransfer>
    {
        private readonly GetTransfer mockFunction;

        public GetTransferTests()
        {
            mockFunction = new GetTransfer(
                mockLogger.Object,
                mockAccessTokenValidator.Object,
                mockTransfersService.Object
                );
        }

        [TestCaseSource(typeof(GetTransferTestCases), nameof(GetTransferTestCases.ValidTransfers))]
        public async Task Should_Return200_When_ValidRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockTransfersService.SetupGetTransfer(accessTokenResult, transfer);

            var response = await mockFunction.Run(getTransferRequest, headers);

            Assert.That(response, Is.InstanceOf<OkObjectResult>());
        }

        [TestCaseSource(typeof(GetTransferTestCases), nameof(GetTransferTestCases.InvalidRequests))]
        public async Task Should_Return500Or404_When_InvalidRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockTransfersService.SetupGetTransfer(accessTokenResult, transfer);

            var response = await mockFunction.Run(getTransferRequest, headers);

            switch (accessTokenResult)
            {
                case ValidAccessTokenResult _:
                    Assert.That(response, Is.InstanceOf<InternalServerErrorMessageResult>());
                    break;

                default:
                    Assert.That(response, Is.InstanceOf<NotFoundResult>());
                    break;
            }
        }

        [TestCaseSource(typeof(GetTransferTestCases), nameof(GetTransferTestCases.UnauthorizedRequests))]
        public async Task Should_Return401Or404_When_UnauthorizedRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);

            var response = await mockFunction.Run(getTransferRequest, headers);

            switch (accessTokenResult)
            {
                case ExpiredAccessTokenResult _:
                    Assert.That(response, Is.InstanceOf<UnauthorizedResult>());
                    break;

                default:
                    Assert.That(response, Is.InstanceOf<NotFoundResult>());
                    break;
            }
        }
    }

    internal static class GetTransferTestCases
    {
        private static GetTransferRequest getTransferRequest = new GetTransferRequest
        {
            TransferToken = "validToken",
            ContainerUrl = true,
            Fields = true
        };

        private static IDictionary<string, string> headers;
        private static IAccessTokenResult accessTokenResult;
        private static Transfer transfer;

        internal static IEnumerable<TestCaseData> ValidTransfers()
        {
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token and body are valid and client is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "validToken",
                Files = true
            };

            yield return GetTestCaseWhen("Token and body are valid and restore is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "invalidToken",
                ContainerUrl = true,
                Fields = true
            };
            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is public, body is valid and client is requesting");
        }

        internal static IEnumerable<TestCaseData> InvalidRequests()
        {
            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "validToken",
                ContainerUrl = true
            };
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is valid, body is missing fields and client is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "validToken",
                Fields = true
            };

            yield return GetTestCaseWhen("Token is valid, body is missing containerUrl and client is requesting");

            getTransferRequest = new GetTransferRequest
            {
                Fields = true
            };

            yield return GetTestCaseWhen("Token is valid, body is missing transferToken and client is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "validToken",
                ContainerUrl = false,
                Fields = false
            };

            yield return GetTestCaseWhen("Token is valid, body is missing files and restore is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "invalidToken",
                ContainerUrl = true
            };
            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is public, body is missing fields and client is requesting");
        }

        internal static IEnumerable<TestCaseData> UnauthorizedRequests()
        {
            accessTokenResult = default;

            yield return GetTestCaseWhen("Token is invalid, body is valid and client is requesting");

            accessTokenResult = new Mock<ExpiredAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is expired, body is valid and client is requesting");

            getTransferRequest = new GetTransferRequest
            {
                TransferToken = "validToken",
                ContainerUrl = false,
                Fields = false,
                Files = true
            };

            yield return GetTestCaseWhen("Token is invalid, body is valid and restore is requesting");
        }

        private static TestCaseData GetTestCaseWhen(string name)
        {
            return new TestCaseData(getTransferRequest, headers, accessTokenResult, transfer)
                .SetName(name);
        }
    }
}