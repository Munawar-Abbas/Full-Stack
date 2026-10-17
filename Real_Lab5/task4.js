
class Person {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }

    introduce() {
        return `My name is ${this.name} and my email is ${this.email}.`;
    }
}

class Student extends Person {
    constructor(name, email, rollNo, marks) {
        super(name, email);
        this.rollNo = rollNo;
        this.marks = marks;
    }

    introduce() {
        return `${super.introduce()} I am a student. Roll No: ${this.rollNo}.`;
    }

    getResult() {
        return this.marks >= 50 ? 'PASS' : 'FAIL';
    }
}

class FacultyMember extends Person {
    constructor(name, email, employeeId, department) {
        super(name, email);
        this.employeeId = employeeId;
        this.department = department;
    }

    introduce() {
        return `${super.introduce()} I am a faculty member in ${this.department}.`;
    }
}

// Creating objects
const student1 = new Student('Ali', 'ali@university.edu', 'CS101', 82);
const student2 = new Student('Sara', 'sara@university.edu', 'CS102', 45);

const teacher1 = new FacultyMember(
    'Ahmed',
    'ahmed@university.edu',
    'F201',
    'Computer Science'
);

const teacher2 = new FacultyMember(
    'Hina',
    'hina@university.edu',
    'F202',
    'Artificial Intelligence'
);

// Runtime polymorphism
const users = [student1, student2, teacher1, teacher2];

console.log('--- User Introductions ---');

users.forEach(user => console.log(user.introduce()));

console.log('\n--- Student Results ---');
console.log(student1.name, student1.getResult());
console.log(student2.name, student2.getResult());

// instanceof
console.log('\n--- instanceof ---');
console.log(student1 instanceof Student); // true
console.log(student1 instanceof Person);  // true
console.log(teacher1 instanceof Student); // false
console.log(teacher1 instanceof Person);  // true

// call() challenge
const guest = {
    name: 'Dr. Ahmed',
    email: 'ahmed@example.com'
};

console.log('\n--- call() ---');
console.log(Person.prototype.introduce.call(guest));

// Detached method challenge
console.log('\n--- Detached Method ---');

const fn = student1.introduce;

try {
    console.log(fn());
} catch (error) {
    console.log('Detached method error:', error.message);
}

// bind() challenge
console.log('\n--- bind() ---');

const boundFn = student1.introduce.bind(student1);
console.log(boundFn());
