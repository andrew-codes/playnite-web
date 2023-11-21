using NUnit.Framework;

namespace PlayniteWebExtension.UnitTests
{
    [TestFixture]
    public class ExampleTest
    {
        [SetUp]
        public void SetUp()
        {
        }

        [Test]
        public void TrueIsTrue()
        {
            var result = true;

            Assert.That(result, Is.EqualTo(true), "True should be true");
        }
    }
}
