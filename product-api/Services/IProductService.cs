using ProductsAPI.ViewModels;

namespace ProductsAPI.Services
{
    public interface IProductService
    {
        Task<List<Guid>> GetAllProductIdsAsync();
        Task<IEnumerable<ProductViewModel>> GetAllAsync();
        Task<ProductViewModel> AddAsync(ProductViewModel product);

        Task<ProductViewModel> UpdateAsync(ProductViewModel product);

        Task DeleteAsync(string id);

        Task<IEnumerable<ProductViewModel>> SyncProductsAsync(ProductSyncRequestViewModel productSyncRequest);
    }
}