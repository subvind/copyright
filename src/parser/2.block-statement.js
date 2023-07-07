function parseBlockStatement(statements) {
  const lines = statements.split('\n');
  let output = '';
  let isHiddenNote = false;

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith('H')) {
      const parts = line.split(' ');
      const name = parts[1];
      const dataType = parts[3];

      if (dataType === 'float') {
        output += `let ${name}: f64 = ${parts[6]};\n`;
      }
    } else if (line.startsWith('(')) {
      const parts = line.split(' ');
      const functionName = parts[0].substring(1);
      const argsIndex = parts.indexOf('Y');
      const returnTypeIndex = parts.lastIndexOf(')');
      const returnType = returnTypeIndex !== -1 ? parts[returnTypeIndex + 1].trim() : '()';
      const args = argsIndex !== -1 ? parts.slice(argsIndex + 1, returnTypeIndex) : [];
      const blockStart = parts.indexOf('{') + 1;
      const blockEnd = parts.lastIndexOf('}');
      const block = parts.slice(blockStart, blockEnd);

      if (args.length === 0) {
        output += `fn ${functionName}() -> ${returnType} {\n`;
        output += '  Ok("test")\n';
        output += '}\n';
      } else {
        output += `fn ${functionName}(`;
        args.forEach((arg, index) => {
          if (index > 0) {
            output += ', ';
          }
          output += `${arg}`;
        });
        output += `) -> ${returnType} {\n`;
        output += `  Ok(${args[0]})\n`;
        output += '}\n';
      }
    } else if (line.startsWith('$$')) {
      isHiddenNote = true;
      output += `${line.substring(2)}\n`;
    } else if (line.startsWith('//')) {
      output += line + '\n';
    } else if (line.startsWith('!')) {
      output += `println("${line.substring(1)}");\n`;
    } else {
      output += line + '\n';
    }
  });

  return output;
}

module.exports = parseBlockStatement