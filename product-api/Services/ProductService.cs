using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using ProductsAPI.Hubs;
using ProductsAPI.Models;
using ProductsAPI.Repos;
using ProductsAPI.ViewModels;

namespace ProductsAPI.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly IMapper _mapper;
        private readonly IHubContext<ProductHub> _hubContext;

        public ProductService(IProductRepository productRepository, IMapper mapper, IHubContext<ProductHub> hubContext) {
            _productRepository = productRepository;
            _mapper = mapper;
            _hubContext = hubContext;
        }

        public async Task<List<Guid>> GetAllProductIdsAsync()
        {
            return await _productRepository.GetAllProductIdsAsync();
        }

        public async Task<IEnumerable<ProductViewModel>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<ProductViewModel>>(products);
        }

        public async Task<ProductViewModel> AddAsync(ProductViewModel product)
        {
            product.ProductId = Guid.NewGuid();
            var addedProduct = await _productRepository.AddAsync(_mapper.Map<Product>(product));
            await _hubContext.Clients.All.SendAsync("ProductAdded", addedProduct);
            return _mapper.Map<ProductViewModel>(addedProduct);
        }

        public async Task<ProductViewModel> UpdateAsync(ProductViewModel product)
        {
            var updatedProduct = await _productRepository.UpdateAsync(_mapper.Map<Product>(product));
            await _hubContext.Clients.All.SendAsync("ProductUpdated", updatedProduct);
            return _mapper.Map<ProductViewModel>(updatedProduct);
        }

        public async Task DeleteAsync(string id)
        {
            var deletedProduct = await _productRepository.GetProduct(new Guid(id));
            await _hubContext.Clients.All.SendAsync("ProductDeleted", deletedProduct);
            await _productRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<ProductViewModel>> SyncProductsAsync(ProductSyncRequestViewModel productSyncRequest)
        {

            foreach (var addedProduct in productSyncRequest.AddedProducts)
            {
                await AddAsync(addedProduct);
            }
            foreach (var updatedProduct in productSyncRequest.UpdatedProducts)
            {
                await UpdateAsync(updatedProduct);
            }
            foreach (var deletedProduct in productSyncRequest.DeletedProducts)
            {
                await DeleteAsync(deletedProduct.ProductId.ToString());
            }

            var products = await _productRepository.SyncProductsAsync();

            return _mapper.Map<IEnumerable<ProductViewModel>>(products);
        }
    }
}