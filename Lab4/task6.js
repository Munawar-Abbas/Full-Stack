function sumOfMultiples(x, y, z) {
    let sum = 0;

    for (let number = 1; number < z; number++) {
        if (number % x === 0 || number % y === 0) {
            sum = sum + number;
        }
    }

    return sum;
}

console.log(sumOfMultiples(3, 5, 10));