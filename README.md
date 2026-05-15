# Recipe API

A production-ready REST API for managing recipes with ingredients and step-by-step instructions. Built with ASP.NET Core 10, Entity Framework Core, and SQLite.

## Features

- **JWT Authentication** — register and login to get a signed token
- **Full CRUD for recipes** — create, read, update, and delete
- **Ownership enforcement** — users can only edit or delete their own recipes
- **Filtering** — search recipes by keyword or category
- **Seed data** — demo account with three example recipes on first run
- **Scalar API UI** — interactive documentation at `/scalar`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | ASP.NET Core 10 |
| ORM | Entity Framework Core 10 |
| Database | SQLite |
| Auth | JWT Bearer (HMAC-SHA512) |
| Password hashing | BCrypt.Net-Next |
| API docs | Scalar + Microsoft.AspNetCore.OpenApi |

---

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/recipe-api.git
cd recipe-api/RecipeApi
```

### 2. Configure the JWT secret

Open `appsettings.json` and replace the secret with a strong value (min 64 chars):

```json
"Jwt": {
  "Secret": "your-own-super-secret-key-min-64-characters-long-replace-this-now"
}
```

> For production use environment variables or .NET User Secrets instead.

### 3. Run the application

```bash
dotnet run
```

The database and seed data are created automatically on startup.

| URL | Description |
|---|---|
| `http://localhost:5000/scalar` | Interactive API documentation |
| `http://localhost:5000/openapi/v1.json` | Raw OpenAPI JSON |

### Demo credentials (seed data)

```
Email:    demo@recipeapi.com
Password: Demo1234!
```

---

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create a new account |
| `POST` | `/api/auth/login` | ❌ | Login and receive a JWT |

**Register body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Secret123!"
}
```

**Login body:**
```json
{
  "email": "alice@example.com",
  "password": "Secret123!"
}
```

**Both return:**
```json
{
  "token": "eyJhbGci...",
  "username": "alice",
  "email": "alice@example.com",
  "expiresAt": "2026-05-16T12:00:00Z"
}
```

Add the token to all authenticated requests:
```
Authorization: Bearer eyJhbGci...
```

---

### Recipes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/recipes` | ❌ | List all recipes (supports `?category=` and `?search=`) |
| `GET` | `/api/recipes/{id}` | ❌ | Get a single recipe with full details |
| `GET` | `/api/recipes/my` | ✅ | Get recipes belonging to the logged-in user |
| `POST` | `/api/recipes` | ✅ | Create a new recipe |
| `PUT` | `/api/recipes/{id}` | ✅ | Update a recipe (owner only) |
| `DELETE` | `/api/recipes/{id}` | ✅ | Delete a recipe (owner only) |

**Create recipe body:**
```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Roman pasta dish.",
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "servings": 4,
  "category": "Pasta",
  "ingredients": [
    { "name": "Spaghetti", "amount": "400", "unit": "g" },
    { "name": "Eggs", "amount": "4", "unit": "pcs" }
  ],
  "instructions": [
    { "stepNumber": 1, "description": "Boil pasta in salted water." },
    { "stepNumber": 2, "description": "Fry pancetta until crispy." }
  ]
}
```

**Update recipe body** (all fields optional):
```json
{
  "title": "Updated Title",
  "servings": 6
}
```

**Query parameters for `GET /api/recipes`:**

| Parameter | Example | Description |
|-----------|---------|-------------|
| `category` | `?category=Pasta` | Filter by category (case-insensitive) |
| `search` | `?search=chicken` | Full-text search on title and description |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200 OK` | Successful read or update |
| `201 Created` | Resource created |
| `204 No Content` | Successful delete |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated but not the owner |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Email or username already taken |

---

## Project Structure

```
RecipeApi/
├── Controllers/          # HTTP endpoints
│   ├── AuthController.cs
│   └── RecipesController.cs
├── Data/
│   ├── AppDbContext.cs   # EF Core context
│   ├── DbSeeder.cs       # Seed data
│   └── Migrations/       # EF Core migrations
├── DTOs/                 # Request/response shapes
├── Infrastructure/
│   └── BearerSecuritySchemeTransformer.cs
├── Models/               # Database entities
│   ├── User.cs
│   ├── Recipe.cs
│   ├── Ingredient.cs
│   └── Instruction.cs
├── Services/             # Business logic
│   ├── ITokenService.cs / TokenService.cs
│   └── IRecipeService.cs / RecipeService.cs
├── appsettings.json
└── Program.cs
```

## License

MIT
