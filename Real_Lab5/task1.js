
const applicants = [
    {
        id: "A101",
        name: "Sara Khan",
        age: "19",
        matricMarks: "91",
        intermediateMarks: "87",
        entryTest: "78",
        program: "BSCS",
        feePaid: "true"
    },
    {
        id: "A102",
        name: "Ahmed Ali",
        age: "twenty",
        matricMarks: "88",
        intermediateMarks: "",
        entryTest: "72",
        program: "BSSE",
        feePaid: "false"
    },
    {
        id: "A103",
        name: "Hassan",
        age: "18",
        matricMarks: "76",
        intermediateMarks: "83",
        entryTest: "91",
        program: "BSAI",
        feePaid: "true"
    }
];

const supportedPrograms = ["BSCS", "BSSE", "BSAI"];
const SELECTION_CUTOFF = 80;

function isMissing(value) {
    return value === undefined ||
           value === null ||
           (typeof value === "string" && value.trim() === "");
}

function convertNumber(value, fieldName, errors) {
    if (isMissing(value)) {
        errors.push(fieldName + " is missing");
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        errors.push(fieldName + " is not a valid number");
        return null;
    }

    return number;
}

function convertFee(value, errors) {
    if (value === "true") return true;
    if (value === "false") return false;

    errors.push("feePaid must be true or false");
    return null;
}

function calculateMerit(matric, intermediate, entryTest) {
    return matric * 0.20 +
           intermediate * 0.30 +
           entryTest * 0.50;
}

function processApplicant(applicant) {
    const errors = [];

    const age = convertNumber(applicant.age, "Age", errors);
    const matric = convertNumber(
        applicant.matricMarks, "Matric marks", errors
    );
    const intermediate = convertNumber(
        applicant.intermediateMarks, "Intermediate marks", errors
    );
    const entryTest = convertNumber(
        applicant.entryTest, "Entry test marks", errors
    );

    const feePaid = convertFee(applicant.feePaid, errors);

    if (isMissing(applicant.id)) {
        errors.push("Applicant ID is missing");
    }

    if (isMissing(applicant.name)) {
        errors.push("Applicant name is missing");
    }

    if (isMissing(applicant.program)) {
        errors.push("Program is missing");
    } else if (!supportedPrograms.includes(applicant.program)) {
        errors.push("Unsupported program");
    }

    if (age !== null && (age < 17 || age > 30)) {
        errors.push("Age must be between 17 and 30");
    }

    const marks = [matric, intermediate, entryTest];

    for (const mark of marks) {
        if (mark !== null && (mark < 0 || mark > 100)) {
            errors.push("Marks must be between 0 and 100");
            break;
        }
    }

    if (errors.length > 0) {
        return {
            id: applicant.id,
            name: applicant.name,
            program: applicant.program,
            merit: null,
            status: "INVALID DATA",
            errors: errors
        };
    }

    const merit = calculateMerit(matric, intermediate, entryTest);

    const eligible =
        merit >= 70 &&
        entryTest >= 60 &&
        intermediate >= 60;

    let status;

    if (!eligible) {
        status = "REJECTED";
    } else if (merit >= SELECTION_CUTOFF && feePaid === true) {
        status = "SELECTED";
    } else {
        status = "WAITING";
    }

    return {
        id: applicant.id,
        name: applicant.name,
        program: applicant.program,
        merit: Number(merit.toFixed(2)),
        status: status,
        errors: []
    };
}

function printResults(results) {
    console.log("\n===== ADMISSION RESULTS =====");

    for (const result of results) {
        console.log("\nApplicant:", result.name);
        console.log("ID:", result.id);
        console.log("Program:", result.program);
        console.log("Merit:", result.merit ?? "Not calculated");
        console.log("Status:", result.status);

        if (result.errors.length > 0) {
            console.log("Errors:", result.errors.join(", "));
        }
    }
}

function printSummary(results, applicants) {
    const validApplicants = results.filter(
        result => result.status !== "INVALID DATA"
    );

    const invalidApplicants = results.filter(
        result => result.status === "INVALID DATA"
    );

    const meritApplicants = validApplicants.filter(
        result => result.merit !== null
    );

    const totalMerit = meritApplicants.reduce(
        (sum, applicant) => sum + applicant.merit, 0
    );

    const averageMerit = meritApplicants.length > 0
        ? totalMerit / meritApplicants.length
        : null;

    const highestMeritApplicant = meritApplicants.length > 0
        ? meritApplicants.reduce((highest, current) =>
            current.merit > highest.merit ? current : highest
        )
        : null;

    const lowestMeritApplicant = meritApplicants.length > 0
        ? meritApplicants.reduce((lowest, current) =>
            current.merit < lowest.merit ? current : lowest
        )
        : null;

    const programCounts = {
        BSCS: 0,
        BSSE: 0,
        BSAI: 0
    };

    for (const applicant of applicants) {
        if (Object.hasOwn(programCounts, applicant.program)) {
            programCounts[applicant.program]++;
        }
    }

    console.log("\n===== FINAL SUMMARY =====");
    console.log("Valid applicants:", validApplicants.length);
    console.log("Invalid applicants:", invalidApplicants.length);

    console.log(
        "Highest merit applicant:",
        highestMeritApplicant
            ? highestMeritApplicant.name + " (" +
              highestMeritApplicant.merit + ")"
            : "No valid merit"
    );

    console.log(
        "Lowest merit among valid applicants:",
        lowestMeritApplicant
            ? lowestMeritApplicant.name + " (" +
              lowestMeritApplicant.merit + ")"
            : "No valid merit"
    );

    console.log(
        "Average merit:",
        averageMerit === null ? "N/A" : averageMerit.toFixed(2)
    );

    console.log("Applicants per program:", programCounts);
}

const results = applicants.map(processApplicant);

printResults(results);
printSummary(results, applicants);
