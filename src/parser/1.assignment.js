function parseAssignment(statements) {
  const lines = statements.split('\n');
  let output = '';
  const variableDeclarations = {};

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);

    if (parts.length < 5) {
      return;
    }

    const name = parts[1];
    const dataType = parts[3];
    const value = parts.slice(5).join(' ');

    let rustType;
    let rustDeclaration;

    if (dataType === 'float') {
      rustType = 'f64';
    } else if (dataType === 'integer') {
      rustType = 'i32';
    } else if (dataType === 'string') {
      rustType = 'str';
    } else if (dataType === 'boolean') {
      rustType = 'bool';
    } else if (dataType === 'array') {
      const arrayType = parts[6];
      rustType = `[${arrayType}; ${value.length}]`;

      if (arrayType === 'integer') {
        value.split(',').forEach((element, index) => {
          value[index] = parseInt(element);
        });
        rustDeclaration = `let ${name}: ${rustType} = [${value}];\n`;
      } else {
        rustDeclaration = `let ${name}: ${rustType} = [${value}];\n`;
      }
    }

    if (rustType && !rustDeclaration) {
      if (parts.includes('=')) {
        rustDeclaration = `let ${name}: ${rustType} = ${value};\n`;
      } else {
        rustDeclaration = `const ${name}: ${rustType} = ${value};\n`;
      }
    }

    if (rustDeclaration) {
      if (parts.includes('S')) {
        rustDeclaration = `const ${name}: &str = ${value};\n`;
      } else if (parts.includes('I')) {
        rustDeclaration = `let mut ${name}: ${rustType} = ${value};\n`;
      }

      if (parts.includes('U')) {
        rustDeclaration = `let mut ${name}: Box<${rustType}> = Box::new(${value});\n`;
      }

      if (variableDeclarations[name]) {
        output = output.replace(variableDeclarations[name], rustDeclaration);
      } else {
        output += rustDeclaration;
      }

      variableDeclarations[name] = rustDeclaration;
    }
  });

  return output;
}

module.exports = parseAssignment