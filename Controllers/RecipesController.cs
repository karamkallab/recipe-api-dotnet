using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecipeApi.DTOs;
using RecipeApi.Services;

namespace RecipeApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class RecipesController(IRecipeService recipeService) : ControllerBase
{
    private int CurrentUserId => int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

    /// <summary>Get all recipes, optionally filtered by category or search term</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RecipeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? search)
    {
        var recipes = await recipeService.GetAllAsync(category, search);
        return Ok(recipes);
    }

    /// <summary>Get a single recipe by ID</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var recipe = await recipeService.GetByIdAsync(id);
        return recipe is null ? NotFound(new { message = $"Recipe {id} not found." }) : Ok(recipe);
    }

    /// <summary>Get all recipes by the authenticated user</summary>
    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<RecipeSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMine()
    {
        var recipes = await recipeService.GetByUserAsync(CurrentUserId);
        return Ok(recipes);
    }

    /// <summary>Create a new recipe (requires authentication)</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(CreateRecipeDto dto)
    {
        var recipe = await recipeService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    /// <summary>Update a recipe (only the owner can update)</summary>
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(typeof(RecipeDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, UpdateRecipeDto dto)
    {
        var recipe = await recipeService.UpdateAsync(id, dto, CurrentUserId);
        if (recipe is null)
        {
            var exists = await recipeService.GetByIdAsync(id);
            return exists is null
                ? NotFound(new { message = $"Recipe {id} not found." })
                : Forbid();
        }
        return Ok(recipe);
    }

    /// <summary>Delete a recipe (only the owner can delete)</summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await recipeService.DeleteAsync(id, CurrentUserId);
        if (!deleted)
        {
            var exists = await recipeService.GetByIdAsync(id);
            return exists is null
                ? NotFound(new { message = $"Recipe {id} not found." })
                : Forbid();
        }
        return NoContent();
    }
}
