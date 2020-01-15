using Microsoft.Extensions.Logging;

using Moq;

using System;

namespace Functions.Tests.Mocks
{
    internal static class MockILogger
    {
        internal static Mock<ILogger<TFunction>> Get<TFunction>()
        {
            var mock = new Mock<ILogger<TFunction>>(MockBehavior.Strict);

            mock.Setup(mock => mock.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                (Func<It.IsAnyType, Exception, string>)It.IsAny<object>())
            );

            return mock;
        }
    }
}