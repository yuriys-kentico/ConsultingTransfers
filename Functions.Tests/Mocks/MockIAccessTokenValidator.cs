using Authorization;
using Authorization.Models;

using Moq;

using System.Collections.Generic;

namespace Functions.Tests.Mocks
{
    internal static class MockIAccessTokenValidator
    {
        internal static Mock<IAccessTokenValidator> Get()
        {
            var mock = new Mock<IAccessTokenValidator>(MockBehavior.Strict);

            return mock;
        }

        internal static void SetupValidateToken(
            this Mock<IAccessTokenValidator> mockAccessTokenValidator,
            IAccessTokenResult accessTokenResult
            )
        {
            mockAccessTokenValidator.Setup(mock => mock.ValidateToken(It.IsAny<IDictionary<string, string>>()))
                .ReturnsAsync(accessTokenResult);
        }
    }
}