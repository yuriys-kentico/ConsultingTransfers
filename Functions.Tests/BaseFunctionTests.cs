using Authorization;

using Core;

using Functions.Tests.Mocks;

using Microsoft.Extensions.Logging;

using Moq;

using Transfers;

namespace Functions.Tests
{
    public class BaseFunctionTests<TFunction>
    {
        protected Mock<ILogger<TFunction>> mockLogger;
        protected Mock<IAccessTokenValidator> mockAccessTokenValidator;
        protected Mock<ITransfersService> mockTransfersService;
        protected Mock<ICoreContext> mockCoreContext;

        public BaseFunctionTests()
        {
            mockLogger = MockILogger.Get<TFunction>();
            mockAccessTokenValidator = MockIAccessTokenValidator.Get();
            mockTransfersService = MockITransfersService.Get();
            mockCoreContext = MockICoreContext.Get();
        }
    }
}