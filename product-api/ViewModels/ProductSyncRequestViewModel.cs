namespace ProductsAPI.ViewModels
{
    public class ProductSyncRequestViewModel
    {
        public List<ProductViewModel> AddedProducts { get; set; }

        public List<ProductViewModel> UpdatedProducts { get; set; }

        public List<ProductViewModel> DeletedProducts { get; set; }
    }
}