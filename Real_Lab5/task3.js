
const student = {
    id: 101,
    name: 'Ali',
    marks: 0,
    scholarship: false,
    address: {
        city: 'Islamabad',
        sector: 'F-10'
    },
    contact: {
        email: 'ali@university.edu'
    }
};

const update = {
    name: 'Ali Khan',
    address: {
        city: 'Rawalpindi'
    },
    contact: {
        phone: '03001234567'
    }
};

// Rest parameters and array destructuring
function updateStudentProfile(student, update, ...options) {
    const [source = 'unknown', requestedBy = 'system'] = options;

    // Object destructuring, renaming, and defaults
    const {
        name: updatedName = student.name,
        marks: updatedMarks = student.marks,
        scholarship: updatedScholarship = student.scholarship,
        address: updatedAddress = {},
        contact: updatedContact = {},
        ...otherUpdates
    } = update;

    // Nested destructuring with renamed variables
    const {
        city: updatedCity = student.address?.city ?? 'Unknown',
        sector: updatedSector = student.address?.sector ?? 'Unknown'
    } = updatedAddress;

    const {
        email: updatedEmail = student.contact?.email ?? '',
        phone: updatedPhone = student.contact?.phone
    } = updatedContact;

    // Object rest: otherUpdates contains remaining top-level fields
    // Spread: create new objects instead of modifying originals
    const newStudent = {
        ...student,
        ...otherUpdates,
        name: updatedName,
        marks: updatedMarks ?? student.marks,
        scholarship: updatedScholarship ?? student.scholarship,
        address: {
            ...student.address,
            ...updatedAddress,
            city: updatedCity,
            sector: updatedSector
        },
        contact: {
            ...student.contact,
            ...updatedContact,
            email: updatedEmail,
            ...(updatedPhone !== undefined ? { phone: updatedPhone } : {})
        }
    };

    // Optional chaining and nullish coalescing
    const city = newStudent.address?.city ?? 'Unknown';

    // Property shorthand
    const summary = { source, requestedBy, city };

    console.log('Update summary:', summary);

    return newStudent;
}

const updatedStudent = updateStudentProfile(
    student,
    update,
    'CampusFlow',
    'Admin'
);

console.log('Original student:', student);
console.log('Updated student:', updatedStudent);

// Reference equality challenge
console.log('Student references equal:', student === updatedStudent);
console.log('Address references equal:', student.address === updatedStudent.address);
console.log('Contact references equal:', student.contact === updatedStudent.contact);

// Confirm original data was not modified
console.log('Original city:', student.address.city);
console.log('Updated city:', updatedStudent.address.city);
console.log('Original email:', student.contact.email);
console.log('Updated email:', updatedStudent.contact.email);
