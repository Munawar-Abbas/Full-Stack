// ============ SETTINGS ============
const API = 'http://localhost:3000';   // backend ka address
let currentCart = { items: [], total: 0 };
let lastError = '';
let alertTimer;

// ============ HELPERS ============
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function money(n) {
  return '$' + Number(n).toFixed(2);
}

function showAlert(msg, type = 'success') {
  const box = document.getElementById('alertBox');
  box.innerHTML = `<div class="alert alert-${type} mb-0">${esc(msg)}</div>`;
  clearTimeout(alertTimer);
  alertTimer = setTimeout(() => (box.innerHTML = ''), 3500);
}

// Backend ko call karne ka ek hi function. Fail ho to null wapas deta hai.
async function api(path, method = 'GET', body) {
  lastError = '';
  try {
    const res = await fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const m = data && data.message;
      throw new Error(Array.isArray(m) ? m.join(', ') : m || 'Something went wrong');
    }
    return data;
  } catch (err) {
    lastError = err instanceof TypeError
      ? 'Backend se connect nahi ho saka. Pehle backend chalayen (npm run start:dev).'
      : err.message;
    showAlert(lastError, 'danger');
    return null;
  }
}

// ============ PRODUCTS ============
async function loadProducts() {
  const products = await api('/products');
  if (!products) return;
  document.getElementById('productList').innerHTML = products.map((p) => `
    <div class="col-sm-6 col-lg-4">
      <div class="card h-100">
        <div class="product-img">${
          p.img
            ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" onerror="this.parentElement.textContent='📦'">`
            : esc(p.emoji)
        }</div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${esc(p.name)}</h5>
          <p class="card-text text-muted">${esc(p.desc)}</p>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-leaf btn-sm" onclick="addToCart(${p.id})">Add to cart</button>
          </div>
        </div>
      </div>
    </div>`).join('');
}

async function addProduct() {
  const name = document.getElementById('pName').value.trim();
  const price = document.getElementById('pPrice').value;
  if (!name || price === '' || Number(price) < 0) {
    return showAlert('Product name aur sahi price likhna zaroori hai.', 'danger');
  }
  const created = await api('/products', 'POST', {
    name,
    price: Number(price),
    emoji: document.getElementById('pEmoji').value.trim() || '📦',
    img: document.getElementById('pImg').value.trim(),
    desc: document.getElementById('pDesc').value.trim(),
  });
  if (!created) return;
  ['pName', 'pPrice', 'pImg', 'pDesc'].forEach((id) => (document.getElementById(id).value = ''));
  document.getElementById('pEmoji').value = '📦';
  showAlert(`"${created.name}" store mein add ho gaya.`);
  loadProducts();
}

// ============ REVIEWS ============
async function loadReviews() {
  const reviews = await api('/reviews');
  if (!reviews) return;
  const box = document.getElementById('reviewList');
  if (reviews.length === 0) {
    box.innerHTML = '<div class="text-muted">Abhi tak koi review nahi. Pehla review aap likhein!</div>';
    return;
  }
  box.innerHTML = reviews.map((r) => `
    <div class="card p-3 review">
      <div class="d-flex justify-content-between">
        <strong>${esc(r.name)}</strong>
        <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p class="mb-0 mt-1">${esc(r.text)}</p>
    </div>`).join('');
}

async function addReview() {
  const name = document.getElementById('revName').value.trim();
  const text = document.getElementById('revText').value.trim();
  if (!name || !text) return showAlert('Naam aur review likhna zaroori hai.', 'danger');
  const created = await api('/reviews', 'POST', {
    name,
    rating: Number(document.getElementById('revRating').value),
    text,
  });
  if (!created) return;
  document.getElementById('revName').value = '';
  document.getElementById('revText').value = '';
  showAlert('Review post ho gaya. Shukriya!');
  loadReviews();
}

// ============ CART ============
function renderCart(cart) {
  currentCart = cart;
  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = count;

  const area = document.getElementById('cartArea');
  if (cart.items.length === 0) {
    area.innerHTML = '<div class="alert alert-secondary">Aap ka cart khali hai. Upar se products add karein.</div>';
    return;
  }
  area.innerHTML = `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>
          ${cart.items.map((i) => `
            <tr>
              <td>${esc(i.product.emoji)} ${esc(i.product.name)}</td>
              <td>${money(i.product.price)}</td>
              <td><input type="number" min="1" class="form-control qty" value="${i.qty}"
                   onchange="updateQty(${i.productId}, this.value)"></td>
              <td class="price">${money(i.subtotal)}</td>
              <td><button class="btn btn-outline-danger btn-sm" onclick="removeItem(${i.productId})">Remove</button></td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="d-flex justify-content-between align-items-center">
      <h4 class="mb-0">Total: <span class="price">${money(cart.total)}</span></h4>
      <button class="btn btn-leaf btn-lg" onclick="openCheckout()">Checkout</button>
    </div>`;
}

async function loadCart() {
  const cart = await api('/cart');
  if (cart) renderCart(cart);
}

async function addToCart(productId) {
  const cart = await api('/cart', 'POST', { productId, qty: 1 });
  if (cart) { renderCart(cart); showAlert('Cart mein add ho gaya.'); }
}

async function updateQty(productId, qty) {
  const cart = await api(`/cart/${productId}`, 'PATCH', { qty: parseInt(qty, 10) });
  if (cart) renderCart(cart);
}

async function removeItem(productId) {
  const cart = await api(`/cart/${productId}`, 'DELETE');
  if (cart) renderCart(cart);
}

// ============ CHECKOUT ============
function openCheckout() {
  document.getElementById('coTotal').textContent = money(currentCart.total);
  document.getElementById('coErr').textContent = '';
  bootstrap.Modal.getOrCreateInstance(document.getElementById('checkoutModal')).show();
}

async function placeOrder() {
  const err = document.getElementById('coErr');
  const name = document.getElementById('coName').value.trim();
  const phone = document.getElementById('coPhone').value.trim();
  const address = document.getElementById('coAddr').value.trim();
  if (!name || !phone || !address) {
    err.textContent = 'Naam, phone aur address zaroori hain.';
    return;
  }
  const order = await api('/orders', 'POST', {
    name, phone, address,
    payment: document.getElementById('coPay').value,
  });
  if (!order) { err.textContent = lastError; return; }

  bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
  ['coName', 'coPhone', 'coAddr'].forEach((id) => (document.getElementById(id).value = ''));
  showAlert(`Order #${order.id} place ho gaya! Total: ${money(order.total)}`);
  loadCart();
}

// ============ START ============
loadProducts();
loadReviews();
loadCart();
