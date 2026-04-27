// This file is designed to trigger many SonarQube issues (Bugs, Vulnerabilities, Smells)

const fs = require('fs');

// 1. Security: Hardcoded credentials
const adminPassword = "SuperSecretPassword123!";

// 2. Security: Insecure use of eval
function executeCode(code) {
    eval(code);
}

// 3. Reliability: Empty catch block
function riskyOperation() {
    try {
        let x = null;
        console.log(x.someProperty);
    } catch (err) {
        // Ignored
    }
}

// 4. Reliability: Always true condition
function checkLogic(val) {
    if (val === val) { 
        console.log("This is always true");
    }
}

// 5. Maintainability: Deeply nested code
function complexFunction(a, b, c, d) {
    if (a) {
        if (b) {
            if (c) {
                if (d) {
                    console.log("Too many levels");
                }
            }
        }
    }
}

// 6. Maintainability: Duplicate code block (A)
function processDataA(data) {
    console.log("Processing start");
    let result = data.map(x => x * 2);
    console.log("Processing end");
    return result;
}

// 7. Maintainability: Duplicate code block (B)
function processDataB(data) {
    console.log("Processing start");
    let result = data.map(x => x * 2);
    console.log("Processing end");
    return result;
}

// 8. Security: Use of sync functions (Smell/Performance)
function readConfig() {
    return fs.readFileSync('config.json');
}

// 9. Bug: Infinite loop (potential)
function potentialLoop(n) {
    let i = 0;
    while (i >= 0) {
        i++;
        if (i > n) break;
    }
}

// 10. Smell: Console logs
console.log("Debug info");

module.exports = { executeCode, riskyOperation };
