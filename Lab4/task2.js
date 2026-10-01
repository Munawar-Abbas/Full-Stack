let givenNumber = 11;
let number = givenNumber + 1;

while (true) {
    let isPrime = true;

    for (let i = 2; i < number; i++) {
        if (number % i === 0) {
            isPrime = false;
            break;
        }
    }

    if (isPrime) {
        console.log(number);
        break;
    }

    number++;
}