namespace RecipeApi.Models;

public class Instruction
{
    public int Id { get; set; }
    public int StepNumber { get; set; }
    public string Description { get; set; } = string.Empty;

    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;
}
