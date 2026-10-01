function roundMe(...numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    let roundedNumbers = [];

    for (let number of numbers) {
        roundedNumbers.push(Math.round(number));
    }

    if (roundedNumbers.length === 1) {
        return roundedNumbers[0];
    }

    return roundedNumbers;
}

console.log(roundMe());
console.log(roundMe(4.7));
console.log(roundMe(4.7, 4.4));