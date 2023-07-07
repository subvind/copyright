let parseAssignment = require('./1.assignment.js')
let parseBlockStatement = require('./2.block-statement.js')

function parse (file) {
    const rustCode = parseAssignment(file);
    console.log(rustCode);

    return rustCode
}

module.exports = parse