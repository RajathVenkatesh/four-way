using ProductsAPI.Models;

namespace ProductsAPI.Repos
{
    public interface IProductRepository
    {
        Task<List<Guid>> GetAllProductIdsAsync();

        Task<IEnumerable<Product>> GetAllAsync();

        Task<Product> GetProduct(Guid id);

        Task<Product> AddAsync(Product product);

        Task<Product> UpdateAsync(Product product);

        Task DeleteAsync(string id);

        Task<IEnumerable<Product>> SyncProductsAsync();

    }
}