using Microsoft.EntityFrameworkCore;
using ProductsAPI.Hubs;
using ProductsAPI.Models;
using ProductsAPI.Profiles;
using ProductsAPI.Repos;
using ProductsAPI.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddOpenApi();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    return ConnectionMultiplexer.Connect(builder.Configuration.GetSection("ConnectionStrings")["Redis"]);
});
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHostedService<RedisCleanupService>();

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        builder => builder  
            .WithOrigins("http://127.0.0.1:8081") 
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAngularApp");
app.UseAuthorization();

app.MapControllers();
app.MapHub<ProductHub>("/notifications/product");
app.Run();




