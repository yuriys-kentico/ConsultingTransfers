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
    public class UpdateTransferTests : BaseFunctionTests<UpdateTransfer>
    {
        private readonly UpdateTransfer mockFunction;

        public UpdateTransferTests()
        {
            mockFunction = new UpdateTransfer(
                mockLogger.Object,
                mockAccessTokenValidator.Object,
                mockTransfersService.Object,
                mockCoreContext.Object
                );
        }

        [TestCaseSource(typeof(UpdateTransferTestCases), nameof(UpdateTransferTestCases.ValidRequests))]
        public async Task Should_Return200_When_ValidRequest(
            UpdateTransferRequest updateTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockCoreContext.SetupLocalization(updateTransferRequest.Localization);
            mockTransfersService.SetupUpdateTransfer();

            var response = await mockFunction.Run(updateTransferRequest, headers);

            Assert.That(response, Is.InstanceOf<OkResult>());
        }

        [TestCaseSource(typeof(UpdateTransferTestCases), nameof(UpdateTransferTestCases.InvalidRequests))]
        public async Task Should_Return500Or404_When_InvalidRequest(
            UpdateTransferRequest updateTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockCoreContext.SetupLocalization(updateTransferRequest.Localization);
            mockTransfersService.SetupUpdateTransfer();

            var response = await mockFunction.Run(updateTransferRequest, headers);

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

        [TestCaseSource(typeof(UpdateTransferTestCases), nameof(UpdateTransferTestCases.UnauthorizedRequests))]
        public async Task Should_Return401Or404_When_UnauthorizedRequest(
            UpdateTransferRequest updateTransferRequest,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);

            var response = await mockFunction.Run(updateTransferRequest, headers);

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

    internal static class UpdateTransferTestCases
    {
        private static UpdateTransferRequest updateTransferRequest = new UpdateTransferRequest
        {
            TransferToken = "validToken",
            Type = "fieldComplete"
        };

        private static IDictionary<string, string> headers;
        private static IAccessTokenResult accessTokenResult;

        internal static IEnumerable<TestCaseData> ValidRequests()
        {
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token and body are valid and client is requesting");

            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is public and client is requesting");
        }

        internal static IEnumerable<TestCaseData> InvalidRequests()
        {
            updateTransferRequest = new UpdateTransferRequest
            {
                Type = "fieldComplete"
            };
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is valid, body is missing transferToken and client is requesting");

            updateTransferRequest = new UpdateTransferRequest
            {
                TransferToken = "validToken"
            };

            yield return GetTestCaseWhen("Token is valid, body is missing type and client is requesting");
        }

        internal static IEnumerable<TestCaseData> UnauthorizedRequests()
        {
            accessTokenResult = new Mock<ExpiredAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is expired and client is requesting");

            accessTokenResult = null;

            yield return GetTestCaseWhen("Token is invalid and client is requesting");
        }

        private static TestCaseData GetTestCaseWhen(string name)
        {
            return new TestCaseData(updateTransferRequest, headers, accessTokenResult)
                .SetName(name);
        }
    }
}