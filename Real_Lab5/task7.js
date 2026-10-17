
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

// Promise-based server request
function queryStudentServer(serverName, studentId, delay, shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error(serverName + " is unavailable"));
                return;
            }

            const student = students.find(s => s.id === studentId);

            if (!student) {
                reject(new Error("Student not found"));
                return;
            }

            resolve(student);
        }, delay);
    });
}

// Promise.any: return the first successful server response
function getStudent(studentId) {
    return Promise.any([
        queryStudentServer("Server A", studentId, 200, true),
        queryStudentServer("Server B", studentId, 300),
        queryStudentServer("Server C", studentId, 500)
    ]);
}

// Promise.race: use a timeout for a service
function withTimeout(promise, milliseconds) {
    let timer;

    const timeoutPromise = new Promise((resolve, reject) => {
        timer = setTimeout(() => {
            reject(new Error("Service timed out"));
        }, milliseconds);
    });

    return Promise.race([promise, timeoutPromise])
        .finally(() => clearTimeout(timer));
}

function getCourse(courseCode) {
    const coursePromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            const course = courses.find(c => c.code === courseCode);

            if (!course) {
                reject(new Error("Course not found"));
                return;
            }

            resolve(course);
        }, 200);
    });

    return withTimeout(coursePromise, 1000);
}

function checkPrerequisites(student, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!student.completedCourses.includes(course.prerequisite)) {
                reject(new Error("Prerequisite not completed"));
                return;
            }

            resolve({ student, course });
        }, 200);
    });
}

function checkSeats(student, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (course.availableSeats <= 0) {
                reject(new Error("No seats available"));
                return;
            }

            resolve({ student, course });
        }, 200);
    });
}

function registerStudent(student, course) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (student.registeredCourses.includes(course.code)) {
                reject(new Error("Already registered"));
                return;
            }

            if (course.availableSeats <= 0) {
                reject(new Error("No seats available"));
                return;
            }

            student.registeredCourses.push(course.code);
            course.availableSeats--;

            resolve({
                student,
                course,
                message: "Registration successful"
            });
        }, 200);
    });
}

// Independent post-registration services
function sendEmail(student) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("Email sent to " + student.name);
        }, 200);
    });
}

function sendSMS(student) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (student.id === 101) {
                reject(new Error("SMS gateway unavailable"));
                return;
            }

            resolve("SMS sent to " + student.name);
        }, 300);
    });
}

function writeAuditLog(student, course) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(
                "Audit log saved: " +
                student.name + " registered in " + course.code
            );
        }, 150);
    });
}

// Main Promise chain
function registerCourse(studentId, courseCode) {
    return getStudent(studentId)
        .then(student => {
            console.log("Student found:", student.name);
            return getCourse(courseCode)
                .then(course => ({ student, course }));
        })
        .then(({ student, course }) => {
            return checkPrerequisites(student, course);
        })
        .then(({ student, course }) => {
            return checkSeats(student, course);
        })
        .then(({ student, course }) => {
            return registerStudent(student, course);
        })
        .then(async result => {
            console.log("\n" + result.message);
            console.log("Student:", result.student.name);
            console.log("Course:", result.course.name);
            console.log("Remaining seats:", result.course.availableSeats);

            // allSettled allows every service to finish
            const serviceResults = await Promise.allSettled([
                sendEmail(result.student),
                sendSMS(result.student),
                writeAuditLog(result.student, result.course)
            ]);

            console.log("\nPost-registration services:");

            serviceResults.forEach((service, index) => {
                const names = ["Email", "SMS", "Audit Log"];

                if (service.status === "fulfilled") {
                    console.log(names[index] + ":", service.value);
                } else {
                    console.log(
                        names[index] + " failed:",
                        service.reason.message
                    );
                }
            });

            return result;
        });
}

// Promise.all: run independent lookups together
Promise.all([
    getStudent(101),
    getCourse("CS401")
])
    .then(([student, course]) => {
        console.log("Parallel lookup:");
        console.log("Student:", student.name);
        console.log("Course:", course.name);
    })
    .catch(error => {
        console.log("Lookup error:", error.message);
    })
    .finally(() => {
        console.log("\nParallel lookup finished.");

        console.log("\n--- Registration Test 1 ---");

        registerCourse(101, "CS401")
            .catch(error => {
                console.log("Registration error:", error.message);
            })
            .finally(() => {
                console.log("\n--- Registration Test 2 ---");

                return registerCourse(102, "CS401")
                    .catch(error => {
                        console.log("Registration error:", error.message);
                    });
            })
            .finally(() => {
                console.log("\n--- Registration Test 3 ---");

                return registerCourse(101, "CS402")
                    .catch(error => {
                        console.log("Registration error:", error.message);
                    });
            })
            .finally(() => {
                console.log("\n--- Registration Test 4 ---");

                return registerCourse(999, "CS401")
                    .catch(error => {
                        console.log("Registration error:", error.message);
                    })
                    .finally(() => {
                        console.log("\nAll tests finished.");
                    });
            });
    });
