
import {
    calculateGrade,
    calculateAverage as getAverage,
    calculateGPA
} from './gradeUtils.js';

import { processTranscript } from './transcriptService.js';

const rawData = `
[
    {
        "id": 101,
        "name": "Ali",
        "courses": [
            { "code": "CS301", "marks": 81 },
            { "code": "CS302", "marks": 74 }
        ]
    },
    {
        "id": 102,
        "name": "Sara",
        "courses": [
            { "code": "CS301", "marks": 91 },
            { "code": "CS302", "marks": 88 }
        ]
    }
]
`;

try {
    const report = processTranscript(rawData);

    console.log('Transcript Report:');
    console.log(report);

    const finalJSON = JSON.stringify(report, null, 2);

    console.log('\nFinal JSON:');
    console.log(finalJSON);

    console.log('\nGrade for 81:', calculateGrade(81));

    const sampleCourses = [
        { code: 'CS301', marks: 81 },
        { code: 'CS302', marks: 74 }
    ];

    console.log('Sample average:', getAverage(sampleCourses));
    console.log('Sample GPA:', calculateGPA(sampleCourses));

} catch (error) {
    console.error(`${error.name}: ${error.message}`);
} finally {
    console.log('\nTranscript processing finished.');
}
