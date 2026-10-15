
/*
Name: Munawar Abbas
Lab Task 2: Promise.all()
*/

async function getUser() {
    const response = await fetch(
        "https://dummyjson.com/users/1"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch user");
    }

    const user = await response.json();

    if (!user.id || !user.firstName || !user.email) {
        throw new Error("Invalid user details");
    }

    return user;
}

async function getProduct() {
    const response = await fetch(
        "https://dummyjson.com/products/1"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch product");
    }

    const product = await response.json();

    if (!product.id || !product.title || !product.price) {
        throw new Error("Invalid product details");
    }

    return product;
}

// Main Promise
function getDetails() {
    return new Promise((resolve, reject) => {

        Promise.all([getUser(), getProduct()])
            .then(([user, product]) => {

                // Check both asynchronous results
                const validUser =
                    user.id && user.firstName && user.email;

                const validProduct =
                    product.id && product.title &&
                    product.price !== undefined &&
                    product.price !== null;

                if (validUser && validProduct) {
                    resolve({
                        user: user,
                        product: product
                    });
                } else {
                    reject(new Error("Fetched data is invalid"));
                }
            })
            .catch(error => {
                reject(error);
            });
    });
}

// Execute the main Promise
getDetails()
    .then(result => {
        console.log("Both operations were successful!");

        console.log("\nUser Details:");
        console.log(result.user);

        console.log("\nProduct Details:");
        console.log(result.product);
    })
    .catch(error => {
        console.log("Main Promise Rejected:", error.message);
    });
