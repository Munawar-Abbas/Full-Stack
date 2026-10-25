const API = '/api';

let user = JSON.parse(localStorage.getItem('bazaarUser') || 'null');
let products = [];
let cart = { items: [] };

const money = price => '$' + Number(price).toFixed(2);

const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[char]));

async function request(url, options = {}) {
    const response = await fetch(API + url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
}

function showMessage(message, type = 'success') {
    document.getElementById('alertBox').innerHTML = `
        <div class="alert alert-${type}">
            ${safe(message)}
        </div>
    `;
}

function renderAuth() {
    const area = document.getElementById('authArea');

    if (user) {
        area.innerHTML = `
            <span class="text-white">Hi, ${safe(user.name)}</span>
            <button class="btn btn-outline-light btn-sm"
                onclick="logout()">Log out</button>
        `;
    } else {
        area.innerHTML = `
            <button class="btn btn-outline-light btn-sm"
                data-bs-toggle="modal" data-bs-target="#loginModal">
                Log in
            </button>
            <button class="btn btn-warning btn-sm"
                data-bs-toggle="modal" data-bs-target="#signupModal">
                Sign up
            </button>
        `;
    }
}

async function loadProducts() {
    products = await request('/products');

    const list = document.getElementById('productList');

    if (!products.length) {
        list.innerHTML = '<p>No products available.</p>';
        return;
    }

    list.innerHTML = products.map(p => `
        <div class="col-md-4">
            <div class="card h-100">
                <div class="product-img">
                    ${p.image
                        ? `<img src="${safe(p.image)}" alt="${safe(p.name)}">`
                        : safe(p.emoji || '📦')}
                </div>
                <div class="card-body d-flex flex-column">
                    <h5>${safe(p.name)}</h5>
                    <p>${safe(p.description)}</p>
                    <p class="price">${money(p.price)}</p>
                    <div class="mt-auto d-flex gap-2">
                        <button class="btn btn-leaf"
                            onclick="addToCart(${p.id})">
                            Add to cart
                        </button>
                        <button class="btn btn-outline-danger"
                            onclick="deleteProduct(${p.id})">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function addProduct() {
    try {
        const name = document.getElementById('pName').value.trim();
        const priceInput = document.getElementById('pPrice').value;
        const price = Number(priceInput);
        const emoji = document.getElementById('pEmoji').value.trim() || '📦';
        const image = document.getElementById('pImg').value.trim();
        const description = document.getElementById('pDesc').value.trim();

        if (!name || priceInput === '' || !Number.isFinite(price) || price < 0) {
            return showMessage('Enter a product name and valid price.', 'warning');
        }

        await request('/products', {
            method: 'POST',
            body: JSON.stringify({ name, price, emoji, image, description })
        });

        document.getElementById('pName').value = '';
        document.getElementById('pPrice').value = '';
        document.getElementById('pEmoji').value = '📦';
        document.getElementById('pImg').value = '';
        document.getElementById('pDesc').value = '';

        await loadProducts();
        showMessage('Product saved successfully.');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;

    try {
        await request('/products/' + id, { method: 'DELETE' });
        await loadProducts();
        await loadCart();
        showMessage('Product deleted.');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function signup() {
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim();
    const password = document.getElementById('suPass').value;
    const errorBox = document.getElementById('suErr');

    errorBox.textContent = '';

    try {
        const result = await request('/users/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });

        user = result.user;
        localStorage.setItem('bazaarUser', JSON.stringify(user));

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('signupModal')
        ).hide();

        renderAuth();
        await loadCart();
        showMessage('Account created successfully.');
    } catch (error) {
        errorBox.textContent = error.message;
    }
}

async function login() {
    const email = document.getElementById('liEmail').value.trim();
    const password = document.getElementById('liPass').value;
    const errorBox = document.getElementById('liErr');

    errorBox.textContent = '';

    try {
        const result = await request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        user = result.user;
        localStorage.setItem('bazaarUser', JSON.stringify(user));

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('loginModal')
        ).hide();

        renderAuth();
        await loadCart();
        showMessage('Login successful.');
    } catch (error) {
        errorBox.textContent = error.message;
    }
}

function logout() {
    user = null;
    cart = { items: [] };
    localStorage.removeItem('bazaarUser');

    renderAuth();
    renderCart();
    showMessage('You have logged out.');
}

async function loadCart() {
    if (!user) {
        cart = { items: [] };
        renderCart();
        return;
    }

    cart = await request('/cart?userId=' + user.id);
    renderCart();
}

async function addToCart(productId) {
    if (!user) {
        showMessage('Please log in before adding products.', 'warning');

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('loginModal')
        ).show();

        return;
    }

    try {
        await request('/cart?userId=' + user.id, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 })
        });

        await loadCart();
        showMessage('Product added to cart.');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

function renderCart() {
    const area = document.getElementById('cartArea');
    const badge = document.getElementById('cartBadge');

    badge.textContent = cart.items.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    if (!user) {
        area.innerHTML = '<p>Please log in to view your cart.</p>';
        return;
    }

    const total = cart.items.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    if (!cart.items.length) {
        area.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    const rows = cart.items.map(item => {
        const p = products.find(product => product.id === item.productId);

        if (!p) return '';

        return `
            <tr>
                <td>${safe(p.name)}</td>
                <td>${money(p.price)}</td>
                <td>
                    <input class="form-control qty" type="number" min="1"
                        value="${item.quantity}"
                        onchange="updateQuantity(${p.id}, this.value)">
                </td>
                <td>${money(p.price * item.quantity)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger"
                        onclick="removeFromCart(${p.id})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    area.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
        <div class="d-flex justify-content-between align-items-center">
            <h5>Total: <span class="price">${money(total)}</span></h5>
            <button class="btn btn-leaf" onclick="openCheckout(${total})">
                Checkout
            </button>
        </div>
    `;
}

async function updateQuantity(productId, value) {
    const quantity = Math.floor(Number(value));

    if (!Number.isFinite(quantity) || quantity < 1) {
        return showMessage('Quantity must be at least 1.', 'warning');
    }

    try {
        await request(`/cart/${productId}?userId=${user.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity })
        });

        await loadCart();
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function removeFromCart(productId) {
    try {
        await request(`/cart/${productId}?userId=${user.id}`, {
            method: 'DELETE'
        });

        await loadCart();
        showMessage('Item removed from cart.');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

function openCheckout(total) {
    document.getElementById('coName').value = user.name;
    document.getElementById('coTotal').textContent = money(total);
    document.getElementById('coErr').textContent = '';

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById('checkoutModal')
    ).show();
}

async function placeOrder() {
    const errorBox = document.getElementById('coErr');
    errorBox.textContent = '';

    try {
        const result = await request('/orders', {
            method: 'POST',
            body: JSON.stringify({
                userId: user.id,
                name: document.getElementById('coName').value.trim(),
                phone: document.getElementById('coPhone').value.trim(),
                address: document.getElementById('coAddr').value.trim(),
                paymentMethod: document.getElementById('coPay').value
            })
        });

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('checkoutModal')
        ).hide();

        await loadCart();

        showMessage(
            `Order #${result.order.id} placed. Total: ${money(result.order.total)}`
        );
    } catch (error) {
        errorBox.textContent = error.message;
    }
}

async function loadReviews() {
    const reviews = await request('/reviews');
    const list = document.getElementById('reviewList');

    if (!reviews.length) {
        list.innerHTML = '<p>No reviews yet. Be the first to write one.</p>';
        return;
    }

    list.innerHTML = reviews.map(review => `
        <div class="card p-3 review">
            <div class="d-flex justify-content-between">
                <strong>${safe(review.name)}</strong>
                <span>${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
            </div>
            <p class="mt-2 mb-0">${safe(review.text)}</p>
        </div>
    `).join('');
}

async function addReview() {
    const name = document.getElementById('revName').value.trim();
    const rating = Number(document.getElementById('revRating').value);
    const text = document.getElementById('revText').value.trim();

    try {
        await request('/reviews', {
            method: 'POST',
            body: JSON.stringify({ name, rating, text })
        });

        document.getElementById('revName').value = '';
        document.getElementById('revText').value = '';

        await loadReviews();
        showMessage('Review saved successfully.');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function init() {
    renderAuth();

    try {
        await loadProducts();
        await loadCart();
        await loadReviews();
    } catch (error) {
        showMessage(
            'Cannot connect to the server. Run node server.js first.',
            'danger'
        );
        console.error(error);
    }
}

init();