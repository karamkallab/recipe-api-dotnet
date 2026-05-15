using Microsoft.EntityFrameworkCore;
using RecipeApi.Models;

namespace RecipeApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync()) return;

        var demoUser = new User
        {
            Username = "chef_demo",
            Email = "demo@recipeapi.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo1234!"),
            CreatedAt = DateTime.UtcNow
        };
        context.Users.Add(demoUser);
        await context.SaveChangesAsync();

        var recipes = new List<Recipe>
        {
            new()
            {
                Title = "Classic Spaghetti Carbonara",
                Description = "A traditional Roman pasta dish with eggs, cheese, pancetta, and black pepper.",
                PrepTimeMinutes = 10,
                CookTimeMinutes = 20,
                Servings = 4,
                Category = "Pasta",
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Ingredients = new List<Ingredient>
                {
                    new() { Name = "Spaghetti", Amount = "400", Unit = "g" },
                    new() { Name = "Pancetta", Amount = "150", Unit = "g" },
                    new() { Name = "Eggs", Amount = "4", Unit = "pcs" },
                    new() { Name = "Pecorino Romano", Amount = "100", Unit = "g" },
                    new() { Name = "Parmesan", Amount = "50", Unit = "g" },
                    new() { Name = "Black pepper", Amount = "2", Unit = "tsp" },
                    new() { Name = "Salt", Amount = "1", Unit = "tbsp" }
                },
                Instructions = new List<Instruction>
                {
                    new() { StepNumber = 1, Description = "Bring a large pot of salted water to boil and cook spaghetti al dente." },
                    new() { StepNumber = 2, Description = "Fry pancetta in a large skillet over medium heat until crispy." },
                    new() { StepNumber = 3, Description = "Whisk together eggs, grated Pecorino Romano, Parmesan, and black pepper." },
                    new() { StepNumber = 4, Description = "Reserve 1 cup pasta water before draining." },
                    new() { StepNumber = 5, Description = "Remove pan from heat, add pasta to pancetta, then quickly stir in egg mixture adding pasta water to create creamy sauce." }
                }
            },
            new()
            {
                Title = "Chicken Tikka Masala",
                Description = "Tender chicken in a rich, spiced tomato cream sauce. A British-Indian classic.",
                PrepTimeMinutes = 20,
                CookTimeMinutes = 40,
                Servings = 6,
                Category = "Curry",
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Ingredients = new List<Ingredient>
                {
                    new() { Name = "Chicken breast", Amount = "800", Unit = "g" },
                    new() { Name = "Plain yogurt", Amount = "200", Unit = "ml" },
                    new() { Name = "Garam masala", Amount = "2", Unit = "tsp" },
                    new() { Name = "Cumin", Amount = "1", Unit = "tsp" },
                    new() { Name = "Turmeric", Amount = "0.5", Unit = "tsp" },
                    new() { Name = "Crushed tomatoes", Amount = "400", Unit = "g" },
                    new() { Name = "Heavy cream", Amount = "200", Unit = "ml" },
                    new() { Name = "Onion", Amount = "2", Unit = "pcs" },
                    new() { Name = "Garlic cloves", Amount = "4", Unit = "pcs" },
                    new() { Name = "Fresh ginger", Amount = "2", Unit = "cm" }
                },
                Instructions = new List<Instruction>
                {
                    new() { StepNumber = 1, Description = "Marinate chicken in yogurt, garam masala, cumin, and turmeric for at least 1 hour." },
                    new() { StepNumber = 2, Description = "Grill or bake chicken at 220°C for 15 minutes until slightly charred." },
                    new() { StepNumber = 3, Description = "Sauté onion, garlic, and ginger in oil until golden." },
                    new() { StepNumber = 4, Description = "Add spices and cook 1 minute, then add crushed tomatoes and simmer 15 minutes." },
                    new() { StepNumber = 5, Description = "Add grilled chicken and cream, simmer 10 minutes. Serve with rice and naan." }
                }
            },
            new()
            {
                Title = "Avocado Toast with Poached Eggs",
                Description = "A simple and nutritious breakfast with creamy avocado on sourdough topped with perfectly poached eggs.",
                PrepTimeMinutes = 5,
                CookTimeMinutes = 10,
                Servings = 2,
                Category = "Breakfast",
                UserId = demoUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Ingredients = new List<Ingredient>
                {
                    new() { Name = "Sourdough bread", Amount = "2", Unit = "slices" },
                    new() { Name = "Ripe avocado", Amount = "1", Unit = "pcs" },
                    new() { Name = "Eggs", Amount = "2", Unit = "pcs" },
                    new() { Name = "Lemon juice", Amount = "1", Unit = "tsp" },
                    new() { Name = "Red pepper flakes", Amount = "0.5", Unit = "tsp" },
                    new() { Name = "Salt and pepper", Amount = "1", Unit = "pinch" },
                    new() { Name = "White vinegar", Amount = "1", Unit = "tbsp" }
                },
                Instructions = new List<Instruction>
                {
                    new() { StepNumber = 1, Description = "Toast sourdough slices until golden and crisp." },
                    new() { StepNumber = 2, Description = "Mash avocado with lemon juice, salt, and pepper." },
                    new() { StepNumber = 3, Description = "Bring a pot of water to gentle simmer, add vinegar." },
                    new() { StepNumber = 4, Description = "Crack each egg into a cup, swirl water, slide egg in, poach 3–4 minutes." },
                    new() { StepNumber = 5, Description = "Spread avocado on toast, top with poached egg and red pepper flakes." }
                }
            }
        };

        context.Recipes.AddRange(recipes);
        await context.SaveChangesAsync();
    }
}
