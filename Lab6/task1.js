
async function fetchValidUser(userId) {
    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/users/${userId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const user = await response.json();

        // Check whether the fetched user is valid
        if (!user.id || !user.name || !user.email) {
            throw new Error("Invalid user data received!");
        }

        return user;
    } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

// Test Task 1
fetchValidUser(1)
    .then(user => {
        console.log("Valid User:", user);
    })
    .catch(error => {
        console.error(error.message);
    });
