using Microsoft.EntityFrameworkCore;

namespace ProductsAPI.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }
       public DbSet<Product> Products { get; set; }
    }
}