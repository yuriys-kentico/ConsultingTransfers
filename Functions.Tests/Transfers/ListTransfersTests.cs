using Authorization.Models;

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
    public class ListTransfersTests : BaseFunctionTests<ListTransfers>
    {
        private readonly ListTransfers mockFunction;

        public ListTransfersTests()
        {
            mockFunction = new ListTransfers(
                mockLogger.Object,
                mockAccessTokenValidator.Object,
                mockTransfersService.Object,
                mockCoreContext.Object
                );
        }

        [TestCaseSource(typeof(ListTransfersTestCases), nameof(ListTransfersTestCases.ValidRequests))]
        public async Task Should_Return200_When_ValidRequest(
            string specificRegion,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);
            mockTransfersService.SetupListTransfers(transfer);
            mockCoreContext.SetupRegion(specificRegion);
            mockCoreContext.SetupRegions(specificRegion);

            var response = await mockFunction.Run(default, headers, specificRegion);

            Assert.That(response, Is.InstanceOf<OkObjectResult>());
        }

        [TestCaseSource(typeof(ListTransfersTestCases), nameof(ListTransfersTestCases.UnauthorizedRequests))]
        public async Task Should_Return401Or404_When_UnauthorizedRequest(
            string specificRegion,
            IDictionary<string, string> headers,
            IAccessTokenResult accessTokenResult,
            Transfer transfer
            )
        {
            mockAccessTokenValidator.SetupValidateToken(accessTokenResult);

            var response = await mockFunction.Run(default, headers, specificRegion);

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

    internal static class ListTransfersTestCases
    {
        private static string region = "us";
        private static IDictionary<string, string> headers;
        private static IAccessTokenResult accessTokenResult;
        private static Transfer transfer;

        internal static IEnumerable<TestCaseData> ValidRequests()
        {
            accessTokenResult = new Mock<ValidAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is valid and client is requesting");

            region = string.Empty;

            yield return GetTestCaseWhen("Token is valid, region is empty, and client is requesting");
        }

        internal static IEnumerable<TestCaseData> UnauthorizedRequests()
        {
            accessTokenResult = new Mock<NoAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is public and client is requesting");

            accessTokenResult = new Mock<ExpiredAccessTokenResult>().Object;

            yield return GetTestCaseWhen("Token is expired and client is requesting");

            region = "zz";
            accessTokenResult = default;

            yield return GetTestCaseWhen("Token is invalid and client is requesting");
        }

        private static TestCaseData GetTestCaseWhen(string name)
        {
            return new TestCaseData(region, headers, accessTokenResult, transfer)
                .SetName(name);
        }
    }
}