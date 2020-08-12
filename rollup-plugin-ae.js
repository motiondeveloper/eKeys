export default function afterEffectsJsx(options = {}) {
  return {
    name: 'after-effects-jsx', // this name will show up in warnings and errors
    generateBundle(options = {}, bundle, isWrite) {
      // format each file
      // to be ae-jsx
      for (const file in bundle) {
        const originalFile = bundle[file];
        const originalCode = originalFile.code;
        const exportNames = originalCode
          .split('\n')
          .filter(line => line.startsWith('exports.'))
          .map(name => name.replace(/exports\..+\s=\s/g, '').replace(';', ''));

        // Remove code rollup adds
        let fixedCode = originalCode
          .replace("'use strict';", '')
          .replace(
            "Object.defineProperty(exports, '__esModule', { value: true });",
            ''
          )
          .replace(/exports\..+\s=\s(({([^;]*)})|.+);/g, '');

        // Replace exported value definitions
        // with jsx compliant (json) syntax
        exportNames.forEach(name => {
          fixedCode = fixedCode
            .replace(`function ${name}`, `"${name}": function`)
            .replace(`const ${name} =`, `"${name}": `)
            .replace(`let ${name} =`, `"${name}": `)
            .replace(`var ${name} =`, `"${name}": `)
            .replace(`}\n"${name}"`, `}\n"${name}"`)
            .replace(`;\n"${name}"`, `,\n"${name}"`);
        });

        // Separate exported items
        // with commas not semi-colons
        let codeLines = fixedCode.split('\n').map(line => {
          let newLine = line;
          exportNames.forEach(name => {
            if (line.startsWith(`"${name}"`)) {
              newLine = newLine.replace(';', ',');
            }
          });
          if (newLine === '}') {
            newLine = '},';
          }
          return newLine;
        });

        // Indent code
        fixedCode = codeLines.map(line => `	${line}`).join('\n');
        // Wrap in braces
        const newCode = `{\n	${fixedCode.trim()}\n}`;

        // Add replace code of file with modified
        bundle[file].code = newCode;
      }
    },
  };
}
