
import Student from './Student.js';
import {
    calculateAverage,
    calculateGPA
} from './gradeUtils.js';

export function processTranscript(rawData) {
    let data;

    try {
        data = JSON.parse(rawData);
    } catch {
        throw new SyntaxError('Malformed JSON data.');
    }

    if (!Array.isArray(data)) {
        throw new TypeError('Transcript must be an array.');
    }

    const ids = new Set();

    const students = data.map(item => {
        if (item.id === undefined || item.id === null) {
            throw new TypeError('Student ID is missing.');
        }

        if (ids.has(item.id)) {
            throw new Error(`Duplicate student ID: ${item.id}`);
        }

        ids.add(item.id);

        if (typeof item.name !== 'string' || !item.name.trim()) {
            throw new TypeError('Student name is missing.');
        }

        if (!Array.isArray(item.courses)) {
            throw new TypeError('Courses must be an array.');
        }

        item.courses.forEach(course => {
            if (
                typeof course.code !== 'string' ||
                !course.code.trim()
            ) {
                throw new TypeError('Course code is missing.');
            }

            if (
                typeof course.marks !== 'number' ||
                !Number.isFinite(course.marks)
            ) {
                throw new TypeError('Marks must be a number.');
            }

            if (course.marks < 0 || course.marks > 100) {
                throw new RangeError(
                    `Marks out of range for ${course.code}.`
                );
            }
        });

        const student = new Student(
            item.id,
            item.name,
            item.courses
        );

        return {
            ...student,
            average: calculateAverage(student.courses),
            gpa: calculateGPA(student.courses)
        };
    });

    return {
        totalStudents: students.length,
        students
    };
}
