export default function afterEffectsJsx(options = {}) {
  return {
    name: 'after-effects-jsx', // this name will show up in warnings and errors
    generateBundle({ functionName }, bundle, isWrite) {
      const originalFile = bundle['index.jsx'];
      const newCode = originalFile.code
        .replace("'use strict';", '')
        .replace('function animate(', '"animate": function(')
        .replace('module.exports = animate;', '');
      delete bundle['index.jsx'];
      console.log(bundle);
      bundle['index.jsx'] = {
        ...originalFile,
        code: newCode,
      };
    },
  };
}
