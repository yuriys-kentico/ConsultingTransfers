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
    public class CreateTransferTests : BaseFunctionTests<CreateTransfer>
    {
        private readonly CreateTransfer mockFunction;

        public CreateTransferTests()
        {
            mockFunction = new CreateTransfer(
                mockLogger.Object,
                mockAccessTokenValidator.Object,
                mockTransfersService.Object,
                mockCoreContext.Object
                );
        }

        [TestCaseSource(typeof(CreateTransferTestCases), nameof(CreateTransferTestCases.ValidRequests))]
        public async Task Should_Return200_When_ValidRequest(
            CreateTransferRequest createTransferRequest,
            string region,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer,
            bool throws
            )
        {
            var (_, _, _, localization) = createTransferRequest;

            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockCoreContext.SetupRegion(region);
            mockCoreContext.SetupLocalization(localization);
            mockTransfersService.SetupCreateTransfer(transfer, throws);

            var response = await mockFunction.Run(createTransferRequest, headers, region);

            Assert.That(response, Is.InstanceOf<OkObjectResult>());
        }

        [TestCaseSource(typeof(CreateTransferTestCases), nameof(CreateTransferTestCases.InvalidRequests))]
        public async Task Should_Return500Or404_When_InvalidRequest(
            CreateTransferRequest createTransferRequest,
            string region,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer,
            bool throws
            )
        {
            var (_, _, _, localization) = createTransferRequest;

            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockCoreContext.SetupRegion(region);
            mockCoreContext.SetupLocalization(localization);
            mockTransfersService.SetupCreateTransfer(transfer, throws);

            var response = await mockFunction.Run(createTransferRequest, headers, region);

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

        [TestCaseSource(typeof(CreateTransferTestCases), nameof(CreateTransferTestCases.UnauthorizedRequests))]
        public async Task Should_Return401Or404_When_UnauthorizedRequest(
            CreateTransferRequest createTransferRequest,
            string region,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer,
            bool throws
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockCoreContext.SetupRegion(region);

            var response = await mockFunction.Run(createTransferRequest, headers, region);

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

    internal static class CreateTransferTestCases
    {
        private static CreateTransferRequest createTransferRequest = new CreateTransferRequest
        {
            Name = "name",
            Customer = "customer",
            Template = "template"
        };

        private static string region = "us";
        private static IDictionary<string, string>? headers;
        private static IAccessTokenResult? accessTokenResult;
        private static Transfer? transfer;
        private static bool throws;

        internal static IEnumerable<TestCaseData> ValidRequests()
        {
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token and body are valid and client is requesting");

            createTransferRequest = new CreateTransferRequest
            {
                Name = "name",
                Customer = "customer"
            };

            yield return GetTestCaseWhen("Token is valid, body is missing template and client is requesting");
        }

        internal static IEnumerable<TestCaseData> InvalidRequests()
        {
            createTransferRequest = new CreateTransferRequest
            {
                Customer = "customer",
                Template = "template"
            };
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;
            throws = true;

            yield return GetTestCaseWhen("Token is valid, body is missing name and client is requesting");

            createTransferRequest = new CreateTransferRequest
            {
                Name = "name",
                Template = "template"
            };

            yield return GetTestCaseWhen("Token is valid, body is missing customer and client is requesting");

            createTransferRequest = new CreateTransferRequest
            {
                Customer = "customer",
                Template = "template"
            };
            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is invalid, body is missing name and client is requesting");

            createTransferRequest = new CreateTransferRequest
            {
                Name = "name",
                Template = "template"
            };

            yield return GetTestCaseWhen("Token is invalid, body is missing customer and client is requesting");
        }

        internal static IEnumerable<TestCaseData> UnauthorizedRequests()
        {
            accessTokenResult = new Mock<ExpiredAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is expired and client is requesting");

            accessTokenResult = default;

            yield return GetTestCaseWhen("Token is invalid and client is requesting");
        }

        private static TestCaseData GetTestCaseWhen(string name)
        {
            return new TestCaseData(createTransferRequest, region, headers, accessTokenResult, transfer, throws)
                .SetName(name);
        }
    }
}