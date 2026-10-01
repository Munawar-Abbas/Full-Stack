function abs(...numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    let result = [];

    for (let number of numbers) {
        result.push(Math.abs(number));
    }

    if (result.length === 1) {
        return result[0];
    }

    return result;
}

function ceil(...numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    let result = [];

    for (let number of numbers) {
        result.push(Math.ceil(number));
    }

    if (result.length === 1) {
        return result[0];
    }

    return result;
}

function floor(...numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    let result = [];

    for (let number of numbers) {
        result.push(Math.floor(number));
    }

    if (result.length === 1) {
        return result[0];
    }

    return result;
}

console.log(abs());
console.log(abs(-5));
console.log(abs(-5, 4.5, -8.2));

console.log(ceil());
console.log(ceil(4.2));
console.log(ceil(4.2, 5.8));

console.log(floor());
console.log(floor(4.8));
console.log(floor(4.8, 5.8));