using RecipeApi.DTOs;

namespace RecipeApi.Services;

public interface IRecipeService
{
    Task<IEnumerable<RecipeSummaryDto>> GetAllAsync(string? category, string? search);
    Task<RecipeDto?> GetByIdAsync(int id);
    Task<RecipeDto> CreateAsync(CreateRecipeDto dto, int userId);
    Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, int userId);
    Task<bool> DeleteAsync(int id, int userId);
    Task<IEnumerable<RecipeSummaryDto>> GetByUserAsync(int userId);
}
