using Microsoft.EntityFrameworkCore;
using ProductsAPI.Models;
using StackExchange.Redis;
using Newtonsoft.Json;

namespace ProductsAPI.Repos
{
    public class ProductRepository : IProductRepository 
    {
        private readonly ApplicationDbContext _applicationDbContext;
        private readonly IDatabase _cache;
        private const string ProductKeyPattern = "product:{0}";
        public ProductRepository(ApplicationDbContext applicationDbContext, IConnectionMultiplexer redis) {
            _applicationDbContext = applicationDbContext; 
            _cache = redis.GetDatabase();
        }

        public async Task<IEnumerable<Product>> SyncProductsAsync()
        {
            var products = await _applicationDbContext.Products.ToListAsync();
            return products;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            var productKeys = await GetProductKeysAsync();

            if (productKeys.Any())
            {
                List<Guid> productsWithIds = await _applicationDbContext.Database
                                                 .SqlQuery<Guid>($"SELECT ProductId FROM [dbo].[Products]")
                                                 .ToListAsync();              
      
                HashSet<Guid> redisProductIds = productKeys
                           .Select(k => ConvertRedisKeyToProductId(k))
                           .Where(id => id.HasValue)
                           .Select(id => id.Value)
                           .ToHashSet();

                var areEqual = productsWithIds.SequenceEqual(redisProductIds);
                 
                if (!areEqual)
                {
             
                    var productsToBeAddedInRedis = productsWithIds.Except(redisProductIds);
                    
                    var productsToBeRemovedInRedis = redisProductIds.Except(productsWithIds);

                    if (productsToBeRemovedInRedis.Any())
                    {
                        productKeys = RemoveSpecificKeys(productKeys, productsToBeRemovedInRedis.Select(x => $"product:{x.ToString()}").ToList());

                        foreach (var id in productsToBeRemovedInRedis)
                        {
                            var key = string.Format(ProductKeyPattern, id);
                            await _cache.KeyDeleteAsync(key);
                        }
                    }

                    if (productsToBeAddedInRedis.Any())
                    {
                        List<Product> missingProducts = await _applicationDbContext.Products
                                   .Where(p => productsToBeAddedInRedis.Contains(p.ProductId))
                                   .ToListAsync();

                        foreach (var product in missingProducts)
                        {
                            await CacheProductAsync(product);
                        }
                    }
                }

                var cachedProducts = await _cache.StringGetAsync(productKeys.ToArray());

                if(cachedProducts != null && cachedProducts.Any())
                {

                    return cachedProducts
                             .AsParallel()
                             .Select(cachedProduct =>
                             {
                                 var product = JsonConvert.DeserializeObject<Product>(cachedProduct);
                                 return product;
                             })
                             .ToList();
                }
                else
                {
                    return Enumerable.Empty<Product>();
                }
            }
            else
            {
                var products = await _applicationDbContext.Products.ToListAsync();

                Task.Run(async () =>
                {
                    foreach (var product in products)
                    {
                        await CacheProductAsync(product);
                    }
                });

                return products;
            }
        }

        public async Task<List<Guid>> GetAllProductIdsAsync()
        {
            return await _applicationDbContext.Database
                                            .SqlQuery<Guid>($"SELECT ProductId FROM [dbo].[Products]")
                                            .ToListAsync();
        }

        public async Task<Product> AddAsync(Product product)
        {
            product.ProductId = Guid.NewGuid();
            await _applicationDbContext.Products.AddAsync(product);
            await _applicationDbContext.SaveChangesAsync();

            Task.Run(async () =>
            {
                await CacheProductAsync(product);
            });

            return product;
        }
 
        public async Task<Product> UpdateAsync(Product product)
        {
            _applicationDbContext.Products.Update(product);
            await _applicationDbContext.SaveChangesAsync();
            Task.Run(async () =>
            {
                await CacheProductAsync(product);
            });

            return product;
        }
 
        public async Task DeleteAsync(string id)
        {
            var product = await _applicationDbContext.Products.FirstOrDefaultAsync(x => x.ProductId == new Guid(id));

            if (product != null)
            {
                _applicationDbContext.Products.Remove(product);
                await _applicationDbContext.SaveChangesAsync();

                Task.Run(async () =>
                {
                    var key = string.Format(ProductKeyPattern, id);
                    await _cache.KeyDeleteAsync(key);
                });

                
            }
        }

        public async Task<Product> GetProduct(Guid id)
        {
            return await _applicationDbContext.Products.FindAsync(id);
        }
 
        private async Task CacheProductAsync(Product product)
        {
            var key = string.Format(ProductKeyPattern, product.ProductId);
            await _cache.StringSetAsync(
                key,
                JsonConvert.SerializeObject(product),
                TimeSpan.FromMinutes(60)
            );
        }

        private async Task<IEnumerable<RedisKey>> GetProductKeysAsync()
        {
            var server = _cache.Multiplexer.GetServer(_cache.Multiplexer.GetEndPoints().First());
            return server.Keys(pattern: "product:*").ToArray();
        }

        private Guid? ConvertRedisKeyToProductId(RedisKey redisKey)
        {
            string keyString = redisKey.ToString();
            var parts = keyString.Split(':');
            if (parts.Length == 2 && Guid.TryParse(parts[1], out Guid productId))
            {
                return productId;
            }
            return null;
        }

        private IEnumerable<RedisKey> RemoveSpecificKeys(IEnumerable<RedisKey> redisKeys, IEnumerable<string> keysToRemove)
        {
            return redisKeys.Where(k => !new HashSet<string>(keysToRemove, StringComparer.OrdinalIgnoreCase).Contains(k.ToString()));
        }
    }
}