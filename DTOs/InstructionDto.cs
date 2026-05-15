using System.ComponentModel.DataAnnotations;

namespace RecipeApi.DTOs;

public class InstructionDto
{
    public int Id { get; set; }
    public int StepNumber { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class CreateInstructionDto
{
    [Required]
    [Range(1, int.MaxValue)]
    public int StepNumber { get; set; }

    [Required]
    public string Description { get; set; } = string.Empty;
}
