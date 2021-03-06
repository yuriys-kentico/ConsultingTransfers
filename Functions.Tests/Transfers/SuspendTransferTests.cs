using Authorization.Models;

using Functions.Models;
using Functions.Tests.Mocks;
using Functions.Transfers;

using Microsoft.AspNetCore.Mvc;

using Moq;

using NUnit.Framework;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace Functions.Tests.Transfers
{
    public class SuspendTransferTests : BaseFunctionTests<SuspendTransfer>
    {
        private readonly SuspendTransfer mockFunction;

        public SuspendTransferTests()
        {
            mockFunction = new SuspendTransfer(
                mockLogger.Object,
                mockAccessTokenValidator.Object,
                mockTransfersService.Object
                );
        }

        [TestCaseSource(typeof(SuspendTransferTestCases), nameof(SuspendTransferTestCases.ValidRequests))]
        public async Task Should_Return200_When_ValidRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            bool throws
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockTransfersService.SetupSuspendTransfer(throws);

            var response = await mockFunction.Run(getTransferRequest, headers);

            Assert.That(response, Is.InstanceOf<OkResult>());
        }

        [TestCaseSource(typeof(SuspendTransferTestCases), nameof(SuspendTransferTestCases.InvalidRequests))]
        public async Task Should_Return500Or404_When_InvalidRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            bool throws
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockTransfersService.SetupSuspendTransfer(throws);

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

        [TestCaseSource(typeof(SuspendTransferTestCases), nameof(SuspendTransferTestCases.UnauthorizedRequests))]
        public async Task Should_Return401Or404_When_UnauthorizedRequest(
            GetTransferRequest getTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            bool throws
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

    internal static class SuspendTransferTestCases
    {
        private static GetTransferRequest getTransferRequest = new GetTransferRequest
        {
            TransferToken = "validToken"
        };

        private static IDictionary<string, string>? headers;
        private static IAccessTokenResult? accessTokenResult;
        private static bool throws;

        internal static IEnumerable<TestCaseData> ValidRequests()
        {
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token and body are valid and client is requesting");
        }

        internal static IEnumerable<TestCaseData> InvalidRequests()
        {
            getTransferRequest = new GetTransferRequest
            {
            };
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;
            throws = true;

            yield return GetTestCaseWhen("Token is valid, body is missing transferToken and client is requesting");
        }

        internal static IEnumerable<TestCaseData> UnauthorizedRequests()
        {
            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is public and client is requesting");

            accessTokenResult = new Mock<ExpiredAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is expired and client is requesting");

            accessTokenResult = default;

            yield return GetTestCaseWhen("Token is invalid and client is requesting");
        }

        private static TestCaseData GetTestCaseWhen(string name)
        {
            return new TestCaseData(getTransferRequest, headers, accessTokenResult, throws)
                .SetName(name);
        }
    }
}