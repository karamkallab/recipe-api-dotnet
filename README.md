# 🍽️ RecipeBook

A full-stack recipe management app with a REST API backend and a vanilla JS frontend. Users can browse recipes, create accounts, and manage their own recipes with full CRUD support.

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![EF Core](https://img.shields.io/badge/EF_Core-10.0-512BD4)](https://learn.microsoft.com/en-us/ef/core/)
[![SQLite](https://img.shields.io/badge/SQLite-embedded-003B57?logo=sqlite)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📸 Screenshots

> _Screenshot placeholder — add your own image here._

```
[ Home page with recipe grid and hero section ]
[ Recipe detail page with ingredients & instructions ]
[ Create / edit recipe form ]
```

**Live demo:** _[Deploy to Azure / Railway / Render and add link here]_

---

## ✨ Features

- **JWT authentication** — register and login, token stored in localStorage
- **Full CRUD for recipes** — create, read, update, and delete
- **Ownership enforcement** — only the author can edit or delete a recipe
- **Search & filter** — by keyword and/or category
- **Vanilla JS SPA** — no framework, hash-based routing, served by the API itself
- **Auto seed data** — demo user and three example recipes on first run
- **Interactive API docs** — Scalar UI at `/scalar`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend framework** | ASP.NET Core 10 |
| **ORM** | Entity Framework Core 10 |
| **Database** | SQLite (file-based, zero config) |
| **Authentication** | JWT Bearer — HMAC-SHA512 |
| **Password hashing** | BCrypt.Net-Next |
| **API documentation** | Scalar + Microsoft.AspNetCore.OpenApi |
| **Frontend** | Vanilla HTML, CSS, JavaScript (no framework) |
| **Images** | Unsplash (static photo IDs per category) |

---

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)

### 1. Clone

```bash
git clone https://github.com/karamkallab/recipe-api-dotnet.git
cd recipe-api-dotnet
```

### 2. Configure JWT secret

Open `appsettings.json` and replace the placeholder with a strong secret (minimum 64 characters):

```json
"Jwt": {
  "Secret": "replace-this-with-a-long-random-string-at-least-64-characters"
}
```

> **Production tip:** use environment variables or `dotnet user-secrets` instead of editing `appsettings.json`.

### 3. Run

```bash
dotnet run
```

The database is created and seeded automatically on first startup.

| URL | What you get |
|---|---|
| `http://localhost:5022/app` | Frontend (recipe browser) |
| `http://localhost:5022/scalar` | Interactive API documentation |
| `http://localhost:5022/openapi/v1.json` | Raw OpenAPI JSON |

### Demo account (seed data)

```
Email:    demo@recipeapi.com
Password: Demo1234!
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | — | Create a new user account |
| `POST` | `/api/auth/login` | — | Login and receive a JWT |

<details>
<summary>Request / response examples</summary>

**POST /api/auth/register**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Secret123!"
}
```

**POST /api/auth/login**
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

Use the token in every authenticated request:
```
Authorization: Bearer eyJhbGci...
```
</details>

---

### Recipes

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/recipes` | — | List all recipes |
| `GET` | `/api/recipes?search=pasta` | — | Search by keyword |
| `GET` | `/api/recipes?category=Curry` | — | Filter by category |
| `GET` | `/api/recipes/{id}` | — | Get one recipe (full details) |
| `GET` | `/api/recipes/my` | ✅ | Get the current user's recipes |
| `POST` | `/api/recipes` | ✅ | Create a recipe |
| `PUT` | `/api/recipes/{id}` | ✅ | Update a recipe (owner only) |
| `DELETE` | `/api/recipes/{id}` | ✅ | Delete a recipe (owner only) |

<details>
<summary>Request / response examples</summary>

**POST /api/recipes — create**
```json
{
  "title": "Pasta Carbonara",
  "description": "Classic Roman pasta dish with eggs and pancetta.",
  "prepTimeMinutes": 10,
  "cookTimeMinutes": 20,
  "servings": 4,
  "category": "Pasta",
  "ingredients": [
    { "name": "Spaghetti", "amount": "400", "unit": "g" },
    { "name": "Eggs",      "amount": "4",   "unit": "pcs" },
    { "name": "Pancetta",  "amount": "150", "unit": "g" }
  ],
  "instructions": [
    { "stepNumber": 1, "description": "Boil pasta in salted water until al dente." },
    { "stepNumber": 2, "description": "Fry pancetta until crispy, remove from heat." },
    { "stepNumber": 3, "description": "Mix eggs with cheese, combine with pasta off heat." }
  ]
}
```

**PUT /api/recipes/{id} — partial update** (all fields optional)
```json
{
  "title": "Spaghetti Carbonara",
  "servings": 6
}
```
</details>

---

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200 OK` | Successful read or update |
| `201 Created` | Resource created |
| `204 No Content` | Successful delete |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Authenticated but not the resource owner |
| `404 Not Found` | Resource does not exist |
| `409 Conflict` | Email or username already in use |

---

## 🗂️ Project Structure

```
RecipeApi/
├── Controllers/
│   ├── AuthController.cs        # POST /api/auth/register & login
│   └── RecipesController.cs     # CRUD /api/recipes
│
├── Data/
│   ├── AppDbContext.cs           # EF Core DbContext
│   ├── DbSeeder.cs               # Seed data (demo user + 3 recipes)
│   └── Migrations/               # EF Core migration files
│
├── DTOs/                         # Request & response shapes
│   ├── RegisterDto.cs
│   ├── LoginDto.cs
│   ├── AuthResponseDto.cs
│   ├── RecipeDto.cs              # Create, Update, Summary, full
│   ├── IngredientDto.cs
│   └── InstructionDto.cs
│
├── Infrastructure/
│   └── BearerSecuritySchemeTransformer.cs  # Adds JWT to OpenAPI docs
│
├── Models/                       # EF Core entities
│   ├── User.cs
│   ├── Recipe.cs
│   ├── Ingredient.cs
│   └── Instruction.cs
│
├── Services/
│   ├── ITokenService.cs / TokenService.cs   # JWT creation
│   └── IRecipeService.cs / RecipeService.cs # Business logic
│
├── frontend/                     # Vanilla JS SPA (served at /app)
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── appsettings.json
├── appsettings.Development.json
└── Program.cs                    # App bootstrap, DI, middleware pipeline
```

---

## 🔒 Security Notes

- Passwords are hashed with BCrypt (cost factor 11) — never stored in plaintext
- JWTs are signed with HMAC-SHA512 and expire after 24 hours
- Authorization checks are enforced server-side; the frontend only hides UI elements
- **Change the JWT secret before deploying** — the default value in `appsettings.json` is a placeholder

---

## 📄 License

[MIT](LICENSE) © 2026 — feel free to use this project as a starting point.
