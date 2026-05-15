namespace RecipeApi.Models;

public class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;

    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;
}
