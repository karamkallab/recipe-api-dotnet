using Microsoft.EntityFrameworkCore;
using RecipeApi.Data;
using RecipeApi.DTOs;
using RecipeApi.Models;

namespace RecipeApi.Services;

public class RecipeService(AppDbContext db) : IRecipeService
{
    public async Task<IEnumerable<RecipeSummaryDto>> GetAllAsync(string? category, string? search)
    {
        var query = db.Recipes.Include(r => r.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(r => r.Category.ToLower() == category.ToLower());

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Title.Contains(search) || r.Description.Contains(search));

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToSummary(r))
            .ToListAsync();
    }

    public async Task<RecipeDto?> GetByIdAsync(int id)
    {
        var recipe = await db.Recipes
            .Include(r => r.User)
            .Include(r => r.Ingredients)
            .Include(r => r.Instructions.OrderBy(i => i.StepNumber))
            .FirstOrDefaultAsync(r => r.Id == id);

        return recipe is null ? null : MapToDto(recipe);
    }

    public async Task<RecipeDto> CreateAsync(CreateRecipeDto dto, int userId)
    {
        var recipe = new Recipe
        {
            Title = dto.Title,
            Description = dto.Description,
            PrepTimeMinutes = dto.PrepTimeMinutes,
            CookTimeMinutes = dto.CookTimeMinutes,
            Servings = dto.Servings,
            Category = dto.Category,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Ingredients = dto.Ingredients.Select(i => new Ingredient
            {
                Name = i.Name,
                Amount = i.Amount,
                Unit = i.Unit
            }).ToList(),
            Instructions = dto.Instructions.Select(i => new Instruction
            {
                StepNumber = i.StepNumber,
                Description = i.Description
            }).ToList()
        };

        db.Recipes.Add(recipe);
        await db.SaveChangesAsync();

        return (await GetByIdAsync(recipe.Id))!;
    }

    public async Task<RecipeDto?> UpdateAsync(int id, UpdateRecipeDto dto, int userId)
    {
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Instructions)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (recipe is null) return null;

        if (dto.Title is not null) recipe.Title = dto.Title;
        if (dto.Description is not null) recipe.Description = dto.Description;
        if (dto.PrepTimeMinutes.HasValue) recipe.PrepTimeMinutes = dto.PrepTimeMinutes.Value;
        if (dto.CookTimeMinutes.HasValue) recipe.CookTimeMinutes = dto.CookTimeMinutes.Value;
        if (dto.Servings.HasValue) recipe.Servings = dto.Servings.Value;
        if (dto.Category is not null) recipe.Category = dto.Category;

        if (dto.Ingredients is not null)
        {
            db.Ingredients.RemoveRange(recipe.Ingredients);
            recipe.Ingredients = dto.Ingredients.Select(i => new Ingredient
            {
                Name = i.Name,
                Amount = i.Amount,
                Unit = i.Unit
            }).ToList();
        }

        if (dto.Instructions is not null)
        {
            db.Instructions.RemoveRange(recipe.Instructions);
            recipe.Instructions = dto.Instructions.Select(i => new Instruction
            {
                StepNumber = i.StepNumber,
                Description = i.Description
            }).ToList();
        }

        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return (await GetByIdAsync(recipe.Id))!;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var recipe = await db.Recipes.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
        if (recipe is null) return false;

        db.Recipes.Remove(recipe);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<RecipeSummaryDto>> GetByUserAsync(int userId)
    {
        return await db.Recipes
            .Include(r => r.User)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => MapToSummary(r))
            .ToListAsync();
    }

    private static RecipeSummaryDto MapToSummary(Recipe r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        Description = r.Description,
        PrepTimeMinutes = r.PrepTimeMinutes,
        CookTimeMinutes = r.CookTimeMinutes,
        Servings = r.Servings,
        Category = r.Category,
        Author = r.User.Username,
        CreatedAt = r.CreatedAt
    };

    private static RecipeDto MapToDto(Recipe r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        Description = r.Description,
        PrepTimeMinutes = r.PrepTimeMinutes,
        CookTimeMinutes = r.CookTimeMinutes,
        Servings = r.Servings,
        Category = r.Category,
        Author = r.User.Username,
        CreatedAt = r.CreatedAt,
        UpdatedAt = r.UpdatedAt,
        Ingredients = r.Ingredients.Select(i => new IngredientDto
        {
            Id = i.Id,
            Name = i.Name,
            Amount = i.Amount,
            Unit = i.Unit
        }).ToList(),
        Instructions = r.Instructions.Select(i => new InstructionDto
        {
            Id = i.Id,
            StepNumber = i.StepNumber,
            Description = i.Description
        }).ToList()
    };
}
