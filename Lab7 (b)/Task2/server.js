const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = 3002;
const FILE = path.join(__dirname, 'data', 'store.json');

async function readData() {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
}

async function saveData(data) {
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

function send(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify(data));
}

async function getBody(req) {
    let text = '';

    for await (const chunk of req) {
        text += chunk;
    }

    return JSON.parse(text || '{}');
}

function nextId(items) {
    return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split('/').filter(Boolean);

    if (url.pathname === '/' || url.pathname === '/index.html' ||
        url.pathname === '/style.css' || url.pathname === '/script.js') {
        const name = url.pathname === '/' ? 'index.html' : parts[0];
        const types = {
            'index.html': 'text/html; charset=utf-8',
            'style.css': 'text/css; charset=utf-8',
            'script.js': 'text/javascript; charset=utf-8'
        };

        try {
            const content = await fs.readFile(path.join(__dirname, name));
            res.writeHead(200, { 'Content-Type': types[name] });
            return res.end(content);
        } catch {
            return send(res, 404, { error: 'File not found' });
        }
    }

    if (!url.pathname.startsWith('/api/')) {
        return send(res, 404, { error: 'Route not found' });
    }

    try {
        const data = await readData();
        const resource = parts[1];
        const id = parts[2];

        if (resource === 'products') {
            if (req.method === 'GET' && !id) {
                return send(res, 200, data.products);
            }

            if (req.method === 'GET' && id) {
                const product = data.products.find(p => p.id === Number(id));
                return product
                    ? send(res, 200, product)
                    : send(res, 404, { error: 'Product not found' });
            }

            if (req.method === 'POST') {
                const body = await getBody(req);
                const name = String(body.name || '').trim();
                const price = Number(body.price);

                if (!name || body.price === '' ||
                    !Number.isFinite(price) || price < 0) {
                    return send(res, 400, {
                        error: 'Enter a product name and valid price'
                    });
                }

                const product = {
                    id: nextId(data.products),
                    name,
                    price,
                    emoji: body.emoji || '📦',
                    image: body.image || '',
                    description: body.description || ''
                };

                data.products.push(product);
                await saveData(data);

                return send(res, 201, {
                    message: 'Product added',
                    product
                });
            }

            if (req.method === 'PUT' && id) {
                const product = data.products.find(p => p.id === Number(id));

                if (!product) {
                    return send(res, 404, { error: 'Product not found' });
                }

                const body = await getBody(req);

                Object.assign(product, body, { id: product.id });

                await saveData(data);
                return send(res, 200, {
                    message: 'Product updated',
                    product
                });
            }

            if (req.method === 'DELETE' && id) {
                const index = data.products.findIndex(p => p.id === Number(id));

                if (index === -1) {
                    return send(res, 404, { error: 'Product not found' });
                }

                const deleted = data.products.splice(index, 1)[0];

                for (const cart of data.carts) {
                    cart.items = cart.items.filter(
                        item => item.productId !== deleted.id
                    );
                }

                await saveData(data);
                return send(res, 200, { message: 'Product deleted' });
            }
        }

        if (resource === 'users' && parts[2] === 'signup' &&
            req.method === 'POST') {
            const body = await getBody(req);
            const name = String(body.name || '').trim();
            const email = String(body.email || '').trim().toLowerCase();
            const password = String(body.password || '');

            if (!name || !email.includes('@') || password.length < 6) {
                return send(res, 400, {
                    error: 'Enter a name, valid email and password of at least 6 characters'
                });
            }

            if (data.users.some(user => user.email === email)) {
                return send(res, 409, { error: 'Email already registered' });
            }

            const user = {
                id: nextId(data.users),
                name,
                email,
                password
            };

            data.users.push(user);
            await saveData(data);

            return send(res, 201, {
                message: 'Account created',
                user: { id: user.id, name: user.name, email: user.email }
            });
        }

        if (resource === 'users' && parts[2] === 'login' &&
            req.method === 'POST') {
            const body = await getBody(req);
            const email = String(body.email || '').trim().toLowerCase();

            const user = data.users.find(
                item => item.email === email &&
                    item.password === String(body.password || '')
            );

            if (!user) {
                return send(res, 401, {
                    error: 'Incorrect email or password'
                });
            }

            return send(res, 200, {
                message: 'Login successful',
                user: { id: user.id, name: user.name, email: user.email }
            });
        }

        if (resource === 'reviews') {
            if (req.method === 'GET') {
                return send(res, 200, data.reviews);
            }

            if (req.method === 'POST') {
                const body = await getBody(req);
                const name = String(body.name || '').trim();
                const text = String(body.text || '').trim();
                const rating = Number(body.rating);

                if (!name || !text || !Number.isInteger(rating) ||
                    rating < 1 || rating > 5) {
                    return send(res, 400, {
                        error: 'Enter name, review and rating from 1 to 5'
                    });
                }

                const review = {
                    id: nextId(data.reviews),
                    name,
                    text,
                    rating,
                    createdAt: new Date().toISOString()
                };

                data.reviews.push(review);
                await saveData(data);

                return send(res, 201, {
                    message: 'Review saved',
                    review
                });
            }
        }

        if (resource === 'cart') {
            const userId = Number(url.searchParams.get('userId'));

            if (!userId || !data.users.some(user => user.id === userId)) {
                return send(res, 401, {
                    error: 'Please log in first'
                });
            }

            let cart = data.carts.find(c => c.userId === userId);

            if (!cart) {
                cart = { userId, items: [] };
                data.carts.push(cart);
            }

            if (req.method === 'GET') {
                return send(res, 200, cart);
            }

            if (req.method === 'POST') {
                const body = await getBody(req);
                const productId = Number(body.productId);
                const quantity = Math.floor(Number(body.quantity) || 1);

                if (!data.products.some(p => p.id === productId)) {
                    return send(res, 404, { error: 'Product not found' });
                }

                const item = cart.items.find(i => i.productId === productId);

                if (item) {
                    item.quantity += quantity;
                } else {
                    cart.items.push({ productId, quantity });
                }

                await saveData(data);
                return send(res, 200, { message: 'Cart updated', cart });
            }

            if (req.method === 'PATCH' && id) {
                const body = await getBody(req);
                const item = cart.items.find(
                    i => i.productId === Number(id)
                );
                const quantity = Math.floor(Number(body.quantity));

                if (!item) {
                    return send(res, 404, { error: 'Cart item not found' });
                }

                if (!Number.isFinite(quantity) || quantity < 1) {
                    return send(res, 400, {
                        error: 'Quantity must be at least 1'
                    });
                }

                item.quantity = quantity;
                await saveData(data);
                return send(res, 200, { message: 'Cart updated', cart });
            }

            if (req.method === 'DELETE' && id) {
                cart.items = cart.items.filter(
                    i => i.productId !== Number(id)
                );

                await saveData(data);
                return send(res, 200, { message: 'Item removed', cart });
            }
        }

        if (resource === 'orders' && req.method === 'POST') {
            const body = await getBody(req);
            const userId = Number(body.userId);
            const user = data.users.find(u => u.id === userId);
            const cart = data.carts.find(c => c.userId === userId);

            if (!user) {
                return send(res, 401, { error: 'Please log in first' });
            }

            if (!cart || !cart.items.length) {
                return send(res, 400, { error: 'Your cart is empty' });
            }

            const name = String(body.name || '').trim();
            const phone = String(body.phone || '').trim();
            const address = String(body.address || '').trim();

            if (!name || !phone || !address) {
                return send(res, 400, {
                    error: 'Enter your name, phone and delivery address'
                });
            }

            const items = cart.items.map(item => {
                const product = data.products.find(
                    p => p.id === item.productId
                );

                return {
                    productId: item.productId,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity
                };
            });

            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            );

            const order = {
                id: nextId(data.orders),
                userId,
                name,
                phone,
                address,
                paymentMethod: body.paymentMethod || 'Cash on delivery',
                items,
                total: Number(total.toFixed(2)),
                status: 'placed',
                createdAt: new Date().toISOString()
            };

            data.orders.push(order);
            cart.items = [];

            await saveData(data);

            return send(res, 201, {
                message: 'Order placed successfully',
                order
            });
        }

        if (resource === 'orders' && req.method === 'GET') {
            const userId = Number(url.searchParams.get('userId'));
            const orders = userId
                ? data.orders.filter(o => o.userId === userId)
                : data.orders;

            return send(res, 200, orders);
        }

        return send(res, 404, { error: 'API endpoint not found' });

    } catch (error) {
        if (error instanceof SyntaxError) {
            return send(res, 400, { error: 'Invalid JSON body' });
        }

        console.error(error);
        return send(res, 500, { error: 'Internal server error' });
    }
});

server.listen(PORT, () => {
    console.log(`Bazaar Lane server running at http://localhost:${PORT}`);
});