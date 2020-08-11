export default function afterEffectsJsx(options = {}) {
  return {
    name: 'after-effects-jsx', // this name will show up in warnings and errors
    generateBundle(options = {}, bundle, isWrite) {
      const originalFile = bundle['index.jsx'];
      const originalCode = originalFile.code;
      const lines = originalCode.split('\n');
      const exportLines = lines.filter(line => line.startsWith('exports.'));
      const exportNames = exportLines.map(name =>
        name.replace(/exports\..+\s=\s/g, '').replace(';', '')
      );

      let fixedCode = originalCode
        // Remove use strict
        .replace("'use strict';", '')
        .replace(
          "Object.defineProperty(exports, '__esModule', { value: true });",
          ''
        )
        // Remove the module.exports
        // whether object or single variable
        .replace(/exports\..+\s=\s(({([^;]*)})|.+);/g, '');
      // Replace exported values
      // with jsx compliant syntax
      exportNames.forEach(
        name =>
          (fixedCode = fixedCode
            .replace(`function ${name}`, `"${name}": function`)
            .replace(`const ${name} =`, `"${name}": `)
            .replace(`let ${name} =`, `"${name}": `)
            .replace(`var ${name} =`, `"${name}": `)
            // Separate functions with commas
            .replace(`}\n"${name}"`, `},\n"${name}"`)
            // Separate values with commas
            .replace(`;\n"${name}"`, `,\n"${name}"`))
      );

      // Wrap in braces
      const newCode = `{\n${fixedCode.trim()}\n}`;
      // Delete original file
      delete bundle['index.jsx'];
      // Add file with replaced code
      bundle['index.jsx'] = {
        ...originalFile,
        code: newCode,
      };
    },
  };
}
