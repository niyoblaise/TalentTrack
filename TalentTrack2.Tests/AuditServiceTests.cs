using Microsoft.EntityFrameworkCore;
using TalentTrack2.Data;
using TalentTrack2.Models;
using TalentTrack2.Services;
using Xunit;

namespace TalentTrack2.Tests
{
    public class AuditServiceTests
    {
        private ApplicationDbContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task GetAuditLogsAsync_ReturnsAllLogs_WhenNoFilterProvided()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            context.AuditLogs.AddRange(
                new AuditLog { ActionType = "POST", EntityName = "Job", Timestamp = DateTime.UtcNow },
                new AuditLog { ActionType = "PUT", EntityName = "Application", Timestamp = DateTime.UtcNow }
            );
            await context.SaveChangesAsync();

            var service = new AuditService(context);

            // Act
            var (logs, totalCount) = await service.GetAuditLogsAsync(1, 10);

            // Assert
            Assert.Equal(2, totalCount);
            Assert.Equal(2, logs.Count());
        }

        [Fact]
        public async Task GetAuditLogsAsync_FiltersByEntityName()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            context.AuditLogs.AddRange(
                new AuditLog { ActionType = "POST", EntityName = "Job", Timestamp = DateTime.UtcNow },
                new AuditLog { ActionType = "PUT", EntityName = "Application", Timestamp = DateTime.UtcNow }
            );
            await context.SaveChangesAsync();

            var service = new AuditService(context);

            // Act
            var (logs, totalCount) = await service.GetAuditLogsAsync(1, 10, "Job");

            // Assert
            Assert.Equal(1, totalCount);
            Assert.Single(logs);
            Assert.Equal("Job", logs.First().EntityName);
        }

        [Fact]
        public async Task GetAuditLogsAsync_ReturnsPaginatedResults()
        {
            // Arrange
            using var context = GetInMemoryDbContext();
            for (int i = 0; i < 15; i++)
            {
                context.AuditLogs.Add(new AuditLog { ActionType = "POST", EntityName = "Job", Timestamp = DateTime.UtcNow.AddMinutes(i) });
            }
            await context.SaveChangesAsync();

            var service = new AuditService(context);

            // Act
            var (logs, totalCount) = await service.GetAuditLogsAsync(1, 10);

            // Assert
            Assert.Equal(15, totalCount);
            Assert.Equal(10, logs.Count());
        }
    }
}
