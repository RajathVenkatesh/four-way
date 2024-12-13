using AutoMapper;
using ProductsAPI.Models;
using ProductsAPI.ViewModels;

namespace ProductsAPI.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Product, ProductViewModel>().ReverseMap();
        }
    }
}