namespace ProductsAPI.Services
{
    using Microsoft.Extensions.Hosting;
    using StackExchange.Redis;
    using System.Threading;
    using System.Threading.Tasks;

    public class RedisCleanupService : IHostedService
    {
        private readonly IConnectionMultiplexer _redis;

        public RedisCleanupService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public Task StartAsync(CancellationToken cancellationToken) => Task.CompletedTask;

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            try
            {
                var server = _redis.GetServer("your_redis_cache", 6380); 
                await server.FlushDatabaseAsync(); 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during Redis cleanup: {ex.Message}");
            }
        }
    }
}