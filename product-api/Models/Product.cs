using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace ProductsAPI.Models
{
    public class Product
    {
        public Guid ProductId { get; set; }

        [Required] 
        [MaxLength(100)]  
        public string Name { get; set; }

        [MaxLength(500)] 
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")] 
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; }

    }
}