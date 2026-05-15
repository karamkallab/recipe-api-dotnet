'use strict';

// ─── Config ──────────────────────────────────────────────────────────────────
const API = '/api';

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('token'),
  user:  JSON.parse(localStorage.getItem('user') || 'null'),
};

// ─── HTML escape ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── API client ───────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(API + path, { ...opts, headers });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.message || `HTTP ${res.status}`), { status: res.status });
  return body;
}

const api = {
  get:    path       => apiFetch(path),
  post:   (path, d)  => apiFetch(path, { method: 'POST',   body: JSON.stringify(d) }),
  put:    (path, d)  => apiFetch(path, { method: 'PUT',    body: JSON.stringify(d) }),
  delete: path       => apiFetch(path, { method: 'DELETE' }),
};

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function setAuth(data) {
  state.token = data.token;
  state.user  = { username: data.username, email: data.email };
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(state.user));
}
function clearAuth() {
  state.token = null;
  state.user  = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function go(hash) { location.hash = hash; }

// ─── Nav bar ──────────────────────────────────────────────────────────────────
function renderNav() {
  const nav = document.getElementById('nav-links');
  if (!nav) return;
  if (state.user) {
    nav.innerHTML = `
      <a href="#my">Mina recept</a>
      <a href="#new" class="btn btn--primary btn--sm">+ Nytt recept</a>
      <span class="nav-user">
        <span>👤 ${esc(state.user.username)}</span>
        <button class="btn btn--ghost btn--sm" onclick="doLogout()">Logga ut</button>
      </span>`;
  } else {
    nav.innerHTML = `
      <a href="#auth">Logga in</a>
      <a href="#auth" class="btn btn--primary btn--sm">Registrera</a>`;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function categoryEmoji(cat = '') {
  const map = { pasta:'🍝', curry:'🍛', breakfast:'🍳', frukost:'🍳',
    soup:'🍜', soppa:'🍜', salad:'🥗', sallad:'🥗', dessert:'🍰',
    seafood:'🐟', fisk:'🐟', meat:'🥩', kött:'🥩',
    vegetarian:'🥦', vegan:'🌱', pizza:'🍕', burger:'🍔' };
  return map[cat.toLowerCase()] || '🍽️';
}

function fmtTime(prep, cook) {
  const t = (prep || 0) + (cook || 0);
  if (!t) return '—';
  return t >= 60 ? `${Math.floor(t / 60)}h ${t % 60 ? (t % 60) + 'min' : ''}`.trim() : `${t} min`;
}

function recipeImageUrl(category = '', title = '', w = 400, h = 260) {
  const kwMap = {
    pasta: 'pasta,italian', curry: 'curry,indian', breakfast: 'breakfast,eggs',
    soup: 'soup,bowl', salad: 'salad,fresh', dessert: 'cake,dessert',
    meat: 'steak,grilled', seafood: 'fish,seafood', vegetarian: 'vegetables',
    vegan: 'vegan,plant', pizza: 'pizza', burger: 'burger',
  };
  const kw = kwMap[category.toLowerCase()]
    || encodeURIComponent(title.split(/\s+/).slice(0, 2).join(','))
    || 'food';
  return `https://source.unsplash.com/${w}x${h}/?food,${kw}`;
}

function loading(el) {
  el.innerHTML = `<div class="loader"><div class="spinner"></div><p>Laddar…</p></div>`;
}

// ─── View: Recipe List ────────────────────────────────────────────────────────
async function viewRecipes(main, myOnly = false) {
  loading(main);
  try {
    const recipes = myOnly
      ? await api.get('/recipes/my')
      : await api.get('/recipes');
    renderRecipeList(main, recipes, myOnly);
  } catch (e) {
    showError(main, 'Kunde inte ladda recept.', e);
  }
}

function renderRecipeList(main, recipes, myOnly) {
  const heading = myOnly ? 'Mina recept' : 'Alla recept';
  main.innerHTML = `
    ${!myOnly ? `
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-tag">Ditt digitala receptkök</p>
        <h1 class="hero-title">Hitta inspiration<br>till nästa måltid</h1>
        <p class="hero-sub">Bläddra bland hundratals recept, skapa egna och dela med vänner.</p>
        <div class="hero-actions">
          ${state.user
            ? `<a href="#new" class="btn btn--primary btn--lg">+ Skapa recept</a>`
            : `<a href="#auth" class="btn btn--primary btn--lg">Kom igång gratis</a>`}
          <button class="btn btn--white btn--lg" onclick="document.getElementById('grid').scrollIntoView({behavior:'smooth'})">
            Utforska recept ↓
          </button>
        </div>
      </div>
    </section>
    ` : ''}
    <div class="page-header">
      <h1>${heading}</h1>
      ${!myOnly ? `
      <div class="filters">
        <input id="q" type="text" placeholder="Sök…" />
        <select id="cat">
          <option value="">Alla kategorier</option>
          ${['Pasta','Curry','Breakfast','Soup','Salad','Dessert','Meat','Seafood','Vegetarian','Vegan']
            .map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <button class="btn btn--primary" onclick="applyFilters()">Sök</button>
      </div>` : ''}
    </div>
    <div class="recipe-grid" id="grid">
      ${recipes.length
        ? recipes.map(r => cardHTML(r, myOnly)).join('')
        : '<p class="state-msg">Inga recept hittades.</p>'}
    </div>`;

  document.getElementById('q')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') applyFilters();
  });
}

function cardHTML(r, showOwnerActions = false) {
  const imgSrc = recipeImageUrl(r.category, r.title, 600, 340);
  return `
    <article class="card" onclick="go('recipe/${r.id}')">
      <div class="card-img-wrap">
        <img class="card-img"
             src="${imgSrc}"
             alt="${esc(r.title)}"
             loading="lazy"
             onerror="this.parentElement.classList.add('card-img-err')" />
        <span class="card-img-badge">${esc(r.category) || 'Övrigt'}</span>
      </div>
      <div class="card-body">
        <div class="card-top">
          <h2 class="card-title">${esc(r.title)}</h2>
        </div>
        <p class="card-desc">${esc(r.description)}</p>
        <div class="card-footer">
          <div class="card-stats">
            <span>⏱ ${fmtTime(r.prepTimeMinutes, r.cookTimeMinutes)}</span>
            <span>👥 ${r.servings} port.</span>
          </div>
          <span class="card-author">av ${esc(r.author)}</span>
        </div>
      </div>
      ${showOwnerActions ? `
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="btn btn--outline btn--sm" onclick="go('edit/${r.id}')">✏️ Redigera</button>
        <button class="btn btn--danger  btn--sm" onclick="deleteRecipe(${r.id}, '${esc(r.title)}', 'my')">🗑️ Ta bort</button>
      </div>` : ''}
    </article>`;
}

async function applyFilters() {
  const q   = document.getElementById('q')?.value.trim()  || '';
  const cat = document.getElementById('cat')?.value        || '';
  const qs  = new URLSearchParams();
  if (q)   qs.set('search', q);
  if (cat) qs.set('category', cat);
  const grid = document.getElementById('grid');
  loading(grid);
  try {
    const recipes = await api.get(`/recipes${qs.toString() ? '?' + qs : ''}`);
    grid.innerHTML = recipes.length
      ? recipes.map(r => cardHTML(r)).join('')
      : '<p class="state-msg">Inga recept hittades.</p>';
  } catch { toast('Sökning misslyckades', 'error'); }
}

// ─── View: Recipe Detail ──────────────────────────────────────────────────────
async function viewDetail(main, id) {
  loading(main);
  try {
    const r = await api.get(`/recipes/${id}`);
    const isOwner = state.user?.username === r.author;
    const bannerSrc = recipeImageUrl(r.category, r.title, 1200, 480);
    main.innerHTML = `
      <div class="detail">
        <button class="btn btn--ghost" onclick="history.back()">← Tillbaka</button>

        <div class="detail-banner-wrap">
          <img class="detail-banner"
               src="${bannerSrc}"
               alt="${esc(r.title)}"
               onerror="this.parentElement.classList.add('banner-err')" />
          <span class="detail-banner-badge">${esc(r.category) || 'Övrigt'}</span>
        </div>

        <div class="detail-info">
          <h1 class="detail-title">${esc(r.title)}</h1>
          <p class="detail-desc">${esc(r.description)}</p>
          <div class="detail-meta">
            <span>⏱ Förb. ${r.prepTimeMinutes} min</span>
            <span>🔥 Tillagn. ${r.cookTimeMinutes} min</span>
            <span>👥 ${r.servings} portioner</span>
            <span>👤 ${esc(r.author)}</span>
          </div>
        </div>

        ${isOwner ? `
        <div class="detail-actions">
          <button class="btn btn--outline" onclick="go('edit/${r.id}')">✏️ Redigera recept</button>
          <button class="btn btn--danger"  onclick="deleteRecipe(${r.id}, '${esc(r.title)}', '')">🗑️ Ta bort</button>
        </div>` : ''}

        <div class="detail-body">
          <section class="detail-section">
            <h2>🛒 Ingredienser</h2>
            <ul class="ing-list">
              ${r.ingredients.map(i => `
                <li>
                  <span class="ing-qty">${esc(i.amount)} ${esc(i.unit)}</span>
                  <span>${esc(i.name)}</span>
                </li>`).join('')}
            </ul>
          </section>

          <section class="detail-section">
            <h2>📋 Instruktioner</h2>
            <ol class="step-list">
              ${r.instructions.map(i => `
                <li>
                  <span class="step-num">${i.stepNumber}</span>
                  <span>${esc(i.description)}</span>
                </li>`).join('')}
            </ol>
          </section>
        </div>
      </div>`;
  } catch (e) {
    showError(main, e.status === 404 ? 'Receptet hittades inte.' : 'Kunde inte ladda receptet.', e);
  }
}

// ─── View: Recipe Form (create / edit) ───────────────────────────────────────
let _ingId = 0, _insId = 0;

async function viewForm(main, id = null) {
  if (!state.user) { go('auth'); return; }
  _ingId = 0; _insId = 0;

  let recipe = null;
  if (id) {
    loading(main);
    try {
      recipe = await api.get(`/recipes/${id}`);
      if (recipe.author !== state.user.username) {
        toast('Du får bara redigera dina egna recept', 'error');
        go('');
        return;
      }
    } catch {
      showError(main, 'Receptet hittades inte.');
      return;
    }
  }

  const ings  = recipe?.ingredients  ?? [{}];
  const insts = recipe?.instructions ?? [{}];

  main.innerHTML = `
    <div class="form-page">
      <button class="btn btn--ghost" onclick="history.back()">← Tillbaka</button>
      <h1>${id ? 'Redigera recept' : 'Skapa nytt recept'}</h1>

      <form id="rf" onsubmit="submitForm(event, ${id ?? 'null'})">
        <div class="form-grid">
          <div class="field col-span-2">
            <label>Titel *</label>
            <input name="title" type="text" required minlength="3"
              placeholder="T.ex. Klassisk lasagne"
              value="${esc(recipe?.title ?? '')}" />
          </div>

          <div class="field col-span-2">
            <label>Beskrivning</label>
            <textarea name="description" rows="2"
              placeholder="Kort beskrivning av receptet…">${esc(recipe?.description ?? '')}</textarea>
          </div>

          <div class="field">
            <label>Kategori</label>
            <input name="category" type="text" list="cat-list"
              placeholder="T.ex. Pasta"
              value="${esc(recipe?.category ?? '')}" />
            <datalist id="cat-list">
              ${['Pasta','Curry','Breakfast','Soup','Salad','Dessert','Meat','Seafood','Vegetarian','Vegan']
                .map(c => `<option value="${c}">`).join('')}
            </datalist>
          </div>

          <div class="field">
            <label>Portioner</label>
            <input name="servings" type="number" min="1" max="100"
              value="${recipe?.servings ?? 4}" />
          </div>

          <div class="field">
            <label>Förberedelsetid (min)</label>
            <input name="prepTimeMinutes" type="number" min="0"
              value="${recipe?.prepTimeMinutes ?? 0}" />
          </div>

          <div class="field">
            <label>Tillagningstid (min)</label>
            <input name="cookTimeMinutes" type="number" min="0"
              value="${recipe?.cookTimeMinutes ?? 0}" />
          </div>
        </div>

        <div class="subsection-header">
          <h2>🛒 Ingredienser</h2>
          <button type="button" class="btn btn--outline btn--sm" onclick="addIng()">+ Lägg till</button>
        </div>
        <div id="ings">${ings.map(i => ingRow(i)).join('')}</div>

        <div class="subsection-header">
          <h2>📋 Instruktioner</h2>
          <button type="button" class="btn btn--outline btn--sm" onclick="addIns()">+ Lägg till</button>
        </div>
        <div id="inss">${insts.map(i => insRow(i)).join('')}</div>

        <div class="form-actions">
          <button type="button" class="btn btn--ghost" onclick="history.back()">Avbryt</button>
          <button type="submit" class="btn btn--primary" id="submit-btn">
            ${id ? 'Spara ändringar' : 'Skapa recept'}
          </button>
        </div>
      </form>
    </div>`;

  refreshSteps();
}

function ingRow(data = {}) {
  const id = ++_ingId;
  return `
    <div class="ing-row" id="ing-${id}">
      <input type="text"  placeholder="Ingrediens *" value="${esc(data.name   ?? '')}" data-f="name"   required />
      <input type="text"  placeholder="Mängd *"      value="${esc(data.amount ?? '')}" data-f="amount" required />
      <input type="text"  placeholder="Enhet"        value="${esc(data.unit   ?? '')}" data-f="unit"   class="unit" />
      <button type="button" class="btn-remove" onclick="removeEl('ing-${id}')" title="Ta bort">×</button>
    </div>`;
}

function insRow(data = {}) {
  const id = ++_insId;
  return `
    <div class="ins-row" id="ins-${id}">
      <span class="ins-badge"></span>
      <textarea placeholder="Beskriv steget *" required>${esc(data.description ?? '')}</textarea>
      <button type="button" class="btn-remove" onclick="removeEl('ins-${id}'); refreshSteps()" title="Ta bort">×</button>
    </div>`;
}

function addIng() {
  document.getElementById('ings').insertAdjacentHTML('beforeend', ingRow());
}
function addIns() {
  document.getElementById('inss').insertAdjacentHTML('beforeend', insRow());
  refreshSteps();
}
function removeEl(id) {
  document.getElementById(id)?.remove();
}
function refreshSteps() {
  document.querySelectorAll('.ins-badge').forEach((el, i) => { el.textContent = i + 1; });
}

async function submitForm(e, id) {
  e.preventDefault();
  const form = e.target;
  const val  = name => form.querySelector(`[name="${name}"]`)?.value.trim() ?? '';

  const payload = {
    title:           val('title'),
    description:     val('description'),
    category:        val('category'),
    servings:        parseInt(val('servings'))        || 1,
    prepTimeMinutes: parseInt(val('prepTimeMinutes')) || 0,
    cookTimeMinutes: parseInt(val('cookTimeMinutes')) || 0,
    ingredients:  [],
    instructions: [],
  };

  document.querySelectorAll('.ing-row').forEach(row => {
    const name   = row.querySelector('[data-f="name"]')  ?.value.trim();
    const amount = row.querySelector('[data-f="amount"]')?.value.trim();
    const unit   = row.querySelector('[data-f="unit"]')  ?.value.trim() ?? '';
    if (name && amount) payload.ingredients.push({ name, amount, unit });
  });

  if (!payload.ingredients.length) {
    toast('Lägg till minst en ingrediens', 'error'); return;
  }

  let step = 1;
  document.querySelectorAll('.ins-row textarea').forEach(ta => {
    const desc = ta.value.trim();
    if (desc) payload.instructions.push({ stepNumber: step++, description: desc });
  });

  if (!payload.instructions.length) {
    toast('Lägg till minst ett steg', 'error'); return;
  }

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sparar…';

  try {
    if (id) {
      await api.put(`/recipes/${id}`, payload);
      toast('Receptet uppdaterades ✓');
      go(`recipe/${id}`);
    } else {
      const created = await api.post('/recipes', payload);
      toast('Receptet skapades ✓');
      go(`recipe/${created.id}`);
    }
  } catch (err) {
    toast(err.message || 'Något gick fel', 'error');
    btn.disabled = false;
    btn.textContent = id ? 'Spara ändringar' : 'Skapa recept';
  }
}

// ─── View: Auth ───────────────────────────────────────────────────────────────
function viewAuth(main, tab = 'login') {
  const isReg = tab === 'register';
  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-tabs">
          <button class="${!isReg ? 'active' : ''}" onclick="viewAuth(document.getElementById('main'), 'login')">Logga in</button>
          <button class="${ isReg ? 'active' : ''}" onclick="viewAuth(document.getElementById('main'), 'register')">Registrera</button>
        </div>
        <div class="auth-body">
          ${isReg ? `
          <div class="field">
            <label>Användarnamn</label>
            <input id="a-user" type="text" minlength="3" placeholder="dittnamn" autocomplete="username" />
          </div>` : ''}
          <div class="field">
            <label>E-post</label>
            <input id="a-email" type="email" placeholder="namn@example.com" autocomplete="email" />
          </div>
          <div class="field">
            <label>Lösenord</label>
            <input id="a-pass" type="password" minlength="6" placeholder="••••••••" autocomplete="${isReg ? 'new-password' : 'current-password'}" />
          </div>
          <button class="btn btn--primary btn--full" onclick="submitAuth('${tab}')">
            ${isReg ? 'Skapa konto' : 'Logga in'}
          </button>
          <p class="auth-hint">
            ${isReg ? 'Lösenord minst 6 tecken.' : 'Demo: demo@recipeapi.com / Demo1234!'}
          </p>
        </div>
      </div>
    </div>`;

  // Allow Enter to submit
  main.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(tab); });
  });
}

async function submitAuth(tab) {
  const email = document.getElementById('a-email')?.value.trim();
  const pass  = document.getElementById('a-pass') ?.value;
  const user  = document.getElementById('a-user') ?.value.trim();

  if (!email || !pass) { toast('Fyll i e-post och lösenord', 'error'); return; }
  if (tab === 'register' && !user) { toast('Fyll i användarnamn', 'error'); return; }

  const btn = document.querySelector('.auth-body .btn--primary');
  btn.disabled = true;
  btn.textContent = 'Väntar…';

  try {
    const data = tab === 'login'
      ? await api.post('/auth/login',    { email, password: pass })
      : await api.post('/auth/register', { username: user, email, password: pass });

    setAuth(data);
    renderNav();
    toast(`Välkommen, ${data.username}! 👋`);
    go('');
  } catch (err) {
    toast(err.message || 'Inloggning misslyckades', 'error');
    btn.disabled = false;
    btn.textContent = tab === 'login' ? 'Logga in' : 'Skapa konto';
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────
async function deleteRecipe(id, title, returnHash) {
  if (!confirm(`Ta bort "${title}"?`)) return;
  try {
    await api.delete(`/recipes/${id}`);
    toast('Receptet togs bort');
    go(returnHash ?? '');
  } catch (err) {
    toast(err.message || 'Kunde inte ta bort receptet', 'error');
  }
}

function doLogout() {
  clearAuth();
  renderNav();
  toast('Du är nu utloggad');
  go('');
}

// ─── Error helper ─────────────────────────────────────────────────────────────
function showError(el, msg) {
  el.innerHTML = `<div class="state-msg is-error"><p>⚠️ ${esc(msg)}</p></div>`;
}

// ─── Router ───────────────────────────────────────────────────────────────────
async function route() {
  renderNav();
  const main = document.getElementById('main');
  const hash = location.hash.slice(1) || '';
  const [view, param] = hash.split('/');

  try {
    if (!view || view === 'recipes') {
      await viewRecipes(main, false);
    } else if (view === 'my') {
      if (!state.user) { go('auth'); return; }
      await viewRecipes(main, true);
    } else if (view === 'recipe' && param) {
      await viewDetail(main, param);
    } else if (view === 'new') {
      await viewForm(main, null);
    } else if (view === 'edit' && param) {
      await viewForm(main, param);
    } else if (view === 'auth') {
      viewAuth(main);
    } else {
      await viewRecipes(main, false);
    }
  } catch (err) {
    showError(main, err.message || 'Något gick fel.');
  }
}

window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);
