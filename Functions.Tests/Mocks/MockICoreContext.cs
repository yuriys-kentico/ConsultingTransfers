using Core;

using Moq;

namespace Functions.Tests.Mocks
{
    internal static class MockICoreContext
    {
        internal static Mock<ICoreContext> Get()
        {
            var mock = new Mock<ICoreContext>(MockBehavior.Strict);

            return mock;
        }

        internal static void SetupRegion(
            this Mock<ICoreContext> mockCoreContext,
            string specificRegion
            )
        {
            mockCoreContext.Setup(mock => mock.SetRegion(specificRegion))
                .Returns(new Region
                {
                    Name = specificRegion
                });
        }

        internal static void SetupRegions(
            this Mock<ICoreContext> mockCoreContext,
            string specificRegion
            )
        {
            mockCoreContext.SetupGet(mock => mock.Regions)
                .Returns(new[] { specificRegion });
        }

        internal static void SetupLocalization(
            this Mock<ICoreContext> mockCoreContext,
            string? localization
            )
        {
            if (localization != default)
            {
                mockCoreContext.SetupSet(mock => mock.Localization = localization);
            }
        }
    }
}