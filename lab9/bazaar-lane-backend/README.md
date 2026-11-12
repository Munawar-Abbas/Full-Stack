# Bazaar Lane Backend (NestJS)

    npm install
    npm run start:dev

Server: http://localhost:3000  (data memory mein rehta hai, restart par reset)

| Method | URL | Kaam |
|---|---|---|
| GET | /products | Product listing |
| POST | /products | Product add {name, price, emoji, img, desc} |
| GET | /reviews | Reviews dekhna |
| POST | /reviews | Review likhna {name, rating, text} |
| GET | /cart | Cart dekhna |
| POST | /cart | Item add {productId, qty} |
| PATCH | /cart/:productId | Qty edit {qty} |
| DELETE | /cart/:productId | Item remove |
| POST | /orders | Checkout {name, phone, address, payment} |
| GET | /orders | Saare orders |
