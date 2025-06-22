using HomeMate.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeMate.Services
{
    public interface IHousingService
    {
        Task<IEnumerable<HousingListing>> SearchHousingAsync(HousingSearchFilters filters);
        Task<IEnumerable<HousingListing>> GetFeaturedListingsAsync();
        Task<HousingListing?> GetListingByIdAsync(string id);
        Task<HousingListing> CreateListingAsync(HousingListing listing);
        Task<bool> UpdateListingAsync(string id, HousingListing listing);
        Task<bool> DeleteListingAsync(string id);
    }
}