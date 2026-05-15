using System.ComponentModel.DataAnnotations;

namespace RecipeApi.DTOs;

public class IngredientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
}

public class CreateIngredientDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Amount { get; set; } = string.Empty;

    public string Unit { get; set; } = string.Empty;
}
