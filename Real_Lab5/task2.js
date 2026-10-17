
const results = [
    { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
    { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
    { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
    { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
    { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
    { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

// A. Result Processing

function getGrade(marks) {
    if (marks >= 85) return 'A';
    if (marks >= 80) return 'A-';
    if (marks >= 75) return 'B+';
    if (marks >= 70) return 'B';
    if (marks >= 65) return 'B-';
    if (marks >= 60) return 'C+';
    if (marks >= 50) return 'C';
    return 'F';
}

// Assumed 4.0 GPA scale because the question
// does not provide a grade-points table.
function getGradePoints(grade) {
    const points = {
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'F': 0.0
    };

    return points[grade];
}

const processedResults = results.map(student => {
    const grade = getGrade(student.marks);

    return {
        ...student,
        grade: grade,
        status: grade === 'F' ? 'FAIL' : 'PASS',
        gradePoints: getGradePoints(grade)
    };
});

console.log('A. RESULT PROCESSING');

processedResults.forEach(student => {
    console.log(student);
});


// B. Ranked Merit List

const meritList = [...processedResults].sort((a, b) => {
    if (b.marks !== a.marks) {
        return b.marks - a.marks;
    }

    return a.name.localeCompare(b.name);
});

console.log('\nB. RANKED MERIT LIST');

meritList.forEach((student, index) => {
    console.log(
        index + 1,
        student.name,
        student.marks,
        student.grade
    );
});


// C. Department Statistics

const departmentData = processedResults.reduce((stats, student) => {
    const department = student.department;

    if (!stats[department]) {
        stats[department] = {
            students: 0,
            totalMarks: 0,
            highest: student.marks,
            passed: 0
        };
    }

    stats[department].students++;
    stats[department].totalMarks += student.marks;

    if (student.marks > stats[department].highest) {
        stats[department].highest = student.marks;
    }

    if (student.status === 'PASS') {
        stats[department].passed++;
    }

    return stats;
}, {});

const departmentStats = Object.fromEntries(
    Object.entries(departmentData).map(([department, data]) => [
        department,
        {
            students: data.students,
            average: Number((data.totalMarks / data.students).toFixed(2)),
            highest: data.highest,
            passed: data.passed
        }
    ])
);

console.log('\nC. DEPARTMENT STATISTICS');
console.log(departmentStats);


// D. Academic Queries

const firstAbove85 = processedResults.find(
    student => student.marks > 85
);

const firstFailedIndex = processedResults.findIndex(
    student => student.status === 'FAIL'
);

const atLeastOneFailed = processedResults.some(
    student => student.status === 'FAIL'
);

const allMarksValid = processedResults.every(
    student => Number.isFinite(student.marks) &&
        student.marks >= 0 &&
        student.marks <= 100
);

const totalMarks = processedResults.reduce(
    (total, student) => total + student.marks,
    0
);

const overallAverage = totalMarks / processedResults.length;

const aboveAverageStudents = processedResults.filter(
    student => student.marks > overallAverage
);

const topThree = meritList.slice(0, 3);

console.log('\nD. ACADEMIC QUERIES');

console.log('First student scoring above 85:', firstAbove85);
console.log('Index of first failed student:', firstFailedIndex);
console.log('At least one student failed:', atLeastOneFailed);
console.log('All marks valid:', allMarksValid);
console.log('Overall average:', overallAverage.toFixed(2));

console.log(
    'Students above average:',
    aboveAverageStudents.map(student => student.name)
);

console.log(
    'Top three students:',
    topThree.map(student => student.name)
);
