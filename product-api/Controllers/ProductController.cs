using Microsoft.AspNetCore.Mvc;
using ProductsAPI.Models;
using ProductsAPI.Services;
using ProductsAPI.ViewModels;

namespace ProductsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
 
        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet("ids")]
        public async Task<ActionResult<List<Guid>>> GetAllProductIdsAsync()
        {
            return Ok(await _productService.GetAllProductIdsAsync());
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductViewModel>>> GetProducts()
        {
            return Ok(await _productService.GetAllAsync());
        }
 
        [HttpPost]
        public async Task<ActionResult<ProductViewModel>> AddProduct(ProductViewModel product)
        {
            return await _productService.AddAsync(product);
        }
 
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductViewModel>> UpdateProduct(string id, ProductViewModel product)
        {
            if (new Guid(id) != product.ProductId)
            {
                return BadRequest();
            }
            return await _productService.UpdateAsync(product); 
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            await _productService.DeleteAsync(id);
            return NoContent();
        }

        [HttpPut("syncProducts")]
        public async Task<ActionResult<IEnumerable<ProductViewModel>>> SyncProducts(ProductSyncRequestViewModel productSyncRequest)
        {
            return Ok(await _productService.SyncProductsAsync(productSyncRequest));
        }
    }
}




