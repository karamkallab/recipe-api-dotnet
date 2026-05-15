using RecipeApi.Models;

namespace RecipeApi.Services;

public interface ITokenService
{
    string CreateToken(User user);
    DateTime GetExpiry();
}
