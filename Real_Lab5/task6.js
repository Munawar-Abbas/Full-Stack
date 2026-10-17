
const students = [
    {
        id: 101,
        name: "Ali",
        completedCourses: ["CS301"],
        registeredCourses: []
    },
    {
        id: 102,
        name: "Sara",
        completedCourses: [],
        registeredCourses: []
    }
];

const courses = [
    {
        code: "CS401",
        name: "Operating Systems",
        prerequisite: "CS301",
        availableSeats: 2
    },
    {
        code: "CS402",
        name: "Artificial Intelligence",
        prerequisite: "CS301",
        availableSeats: 0
    }
];

function loadStudent(studentId, callback) {
    setTimeout(() => {
        const student = students.find(s => s.id === studentId);

        if (!student) {
            return callback(new Error("Student not found"));
        }

        callback(null, student);
    }, 500);
}

function checkPrerequisites(student, course, callback) {
    setTimeout(() => {
        if (!student.completedCourses.includes(course.prerequisite)) {
            return callback(
                new Error("Prerequisite course not completed")
            );
        }

        callback(null, student);
    }, 500);
}

function checkSeats(course, callback) {
    setTimeout(() => {
        if (course.availableSeats <= 0) {
            return callback(new Error("No seats available"));
        }

        callback(null, course);
    }, 500);
}

function registerCourse(student, course, callback) {
    setTimeout(() => {
        if (student.registeredCourses.includes(course.code)) {
            return callback(new Error("Already registered"));
        }

        student.registeredCourses.push(course.code);
        course.availableSeats--;

        callback(null, {
            studentName: student.name,
            courseName: course.name,
            courseCode: course.code,
            remainingSeats: course.availableSeats
        });
    }, 500);
}

function registerStudent(studentId, courseCode, callback) {
    loadStudent(studentId, (error, student) => {
        if (error) return callback(error);

        const course = courses.find(c => c.code === courseCode);

        if (!course) {
            return callback(new Error("Course not found"));
        }

        checkPrerequisites(student, course, (error) => {
            if (error) return callback(error);

            checkSeats(course, (error) => {
                if (error) return callback(error);

                registerCourse(student, course, (error, result) => {
                    if (error) return callback(error);

                    callback(null, result);
                });
            });
        });
    });
}

// Test 1: Successful registration
registerStudent(101, "CS401", (error, result) => {
    if (error) {
        console.log("Test 1 Error:", error.message);
    } else {
        console.log("Test 1 Success:", result);
    }
});

// Test 2: Prerequisite not completed
registerStudent(102, "CS401", (error, result) => {
    if (error) {
        console.log("Test 2 Error:", error.message);
    } else {
        console.log("Test 2 Success:", result);
    }
});

// Test 3: Course has no seats
registerStudent(101, "CS402", (error, result) => {
    if (error) {
        console.log("Test 3 Error:", error.message);
    } else {
        console.log("Test 3 Success:", result);
    }
});

// Test 4: Student does not exist
registerStudent(999, "CS401", (error, result) => {
    if (error) {
        console.log("Test 4 Error:", error.message);
    } else {
        console.log("Test 4 Success:", result);
    }
});
