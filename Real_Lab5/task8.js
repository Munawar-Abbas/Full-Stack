
const studentsData = [
    { id: 101, name: "Ali", department: "CS" },
    { id: 102, name: "Sara", department: "SE" },
    { id: 103, name: "Ahmed", department: "CS" },
    { id: 104, name: "Hina", department: "AI" },
    { id: 105, name: "Usman", department: "SE" }
];

const coursesData = [
    { code: "CS301", name: "Operating Systems" },
    { code: "CS302", name: "Data Structures" },
    { code: "CS303", name: "Artificial Intelligence" }
];

const resultsData = [
    { studentId: 101, marks: 85 },
    { studentId: 102, marks: 72 },
    { studentId: 103, marks: 42 },
    { studentId: 104, marks: 95 },
    { studentId: 105, marks: 38 }
];

// Fake API for practicing successful and failed responses
function fakeFetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        if (options.signal?.aborted) {
            reject(new Error("Request aborted"));
            return;
        }

        let delay = url === "/slow" ? 2000 : 300;

        const timer = setTimeout(() => {
            if (options.signal?.aborted) {
                reject(new Error("Request aborted"));
                return;
            }

            if (url === "/network-error") {
                reject(new TypeError("Network connection failed"));
                return;
            }

            if (url === "/not-found") {
                resolve({
                    ok: false,
                    status: 404,
                    json: async () => ({ message: "Not found" })
                });
                return;
            }

            if (url === "/server-error") {
                resolve({
                    ok: false,
                    status: 500,
                    json: async () => ({ message: "Server error" })
                });
                return;
            }

            if (url === "/invalid-json") {
                resolve({
                    ok: true,
                    status: 200,
                    json: async () => {
                        throw new SyntaxError("Invalid JSON data");
                    }
                });
                return;
            }

            let data;

            if (url === "/users") {
                data = studentsData;
            } else if (url === "/courses") {
                data = coursesData;
            } else if (url === "/results") {
                data = resultsData;
            } else if (url === "/slow") {
                data = { message: "Slow response received" };
            } else {
                resolve({
                    ok: false,
                    status: 404,
                    json: async () => ({ message: "Not found" })
                });
                return;
            }

            resolve({
                ok: true,
                status: 200,
                json: async () => data
            });
        }, delay);

        options.signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new Error("Request aborted"));
        }, { once: true });
    });
}

// Get JSON and handle HTTP, network and parsing errors
async function getJSON(url, fetchImplementation = fakeFetch, signal) {
    const response = await fetchImplementation(url, { signal });

    if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${url}`);
    }

    return await response.json();
}

// Stop waiting when the request exceeds the time limit
async function fetchWithTimeout(url, milliseconds) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, milliseconds);

    try {
        return await getJSON(url, fakeFetch, controller.signal);
    } catch (error) {
        if (controller.signal.aborted) {
            throw new Error(`Timeout: ${url} took too long`);
        }

        throw error;
    } finally {
        clearTimeout(timer);
    }
}

// Combine data from all three APIs
async function generateAcademicReport() {
    try {
        console.log("Fetching academic data concurrently...");

        const [students, courses, results] = await Promise.all([
            fetchWithTimeout("/users", 1000),
            fetchWithTimeout("/courses", 1000),
            fetchWithTimeout("/results", 1000)
        ]);

        const totalMarks = results.reduce(
            (sum, result) => sum + result.marks, 0
        );

        const averageMarks = totalMarks / results.length;

        const highestResult = results.reduce((highest, current) =>
            current.marks > highest.marks ? current : highest
        );

        const highestStudent = students.find(
            student => student.id === highestResult.studentId
        );

        const failedStudents = results.filter(
            result => result.marks < 50
        );

        const departmentStats = {};

        students.forEach(student => {
            if (!departmentStats[student.department]) {
                departmentStats[student.department] = {
                    students: 0,
                    totalMarks: 0,
                    resultCount: 0
                };
            }

            const department = departmentStats[student.department];

            department.students++;

            const result = results.find(
                item => item.studentId === student.id
            );

            if (result) {
                department.totalMarks += result.marks;
                department.resultCount++;
            }
        });

        Object.keys(departmentStats).forEach(departmentName => {
            const department = departmentStats[departmentName];

            department.averageMarks = department.resultCount
                ? Number(
                    (department.totalMarks / department.resultCount).toFixed(2)
                )
                : 0;

            delete department.totalMarks;
            delete department.resultCount;
        });

        const report = {
            totalStudents: students.length,
            totalCourses: courses.length,
            averageMarks: Number(averageMarks.toFixed(2)),
            highestStudent: {
                name: highestStudent.name,
                department: highestStudent.department,
                marks: highestResult.marks
            },
            failedStudents: failedStudents.length,
            departmentStats
        };

        console.log("\nACADEMIC REPORT");
        console.log(JSON.stringify(report, null, 2));

    } catch (error) {
        console.log("Could not generate report:", error.message);
    } finally {
        console.log("\nAcademic report process finished.");
    }
}

// Test different types of API failures
async function testErrorHandling() {
    const testURLs = [
        "/not-found",
        "/server-error",
        "/network-error",
        "/invalid-json",
        "/slow"
    ];

    console.log("\nERROR HANDLING TESTS");

    for (const url of testURLs) {
        try {
            const data = await fetchWithTimeout(url, 700);
            console.log(url, "Success:", data);
        } catch (error) {
            console.log(url, "Error:", error.message);
        }
    }
}

async function main() {
    await generateAcademicReport();
    await testErrorHandling();
}

main();
