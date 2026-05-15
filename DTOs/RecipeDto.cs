using System.ComponentModel.DataAnnotations;

namespace RecipeApi.DTOs;

public class RecipeDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PrepTimeMinutes { get; set; }
    public int CookTimeMinutes { get; set; }
    public int Servings { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<IngredientDto> Ingredients { get; set; } = new();
    public List<InstructionDto> Instructions { get; set; } = new();
}

public class RecipeSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PrepTimeMinutes { get; set; }
    public int CookTimeMinutes { get; set; }
    public int Servings { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateRecipeDto
{
    [Required]
    [MinLength(3)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(0, 1440)]
    public int PrepTimeMinutes { get; set; }

    [Range(0, 1440)]
    public int CookTimeMinutes { get; set; }

    [Range(1, 100)]
    public int Servings { get; set; } = 1;

    public string Category { get; set; } = string.Empty;

    [MinLength(1)]
    public List<CreateIngredientDto> Ingredients { get; set; } = new();

    [MinLength(1)]
    public List<CreateInstructionDto> Instructions { get; set; } = new();
}

public class UpdateRecipeDto
{
    [MinLength(3)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [Range(0, 1440)]
    public int? PrepTimeMinutes { get; set; }

    [Range(0, 1440)]
    public int? CookTimeMinutes { get; set; }

    [Range(1, 100)]
    public int? Servings { get; set; }

    public string? Category { get; set; }

    public List<CreateIngredientDto>? Ingredients { get; set; }

    public List<CreateInstructionDto>? Instructions { get; set; }
}
