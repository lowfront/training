const ffi = require('ffi-napi');

const user32 = new ffi.Library('user32', {
  FindWindowA: ['ulong', ['string', 'string']],
  FindWindowExA: ['ulong', ['ulong', 'ulong', 'string', 'ulong']],
  GetDesktopWindow: ['ulong', []],
  SetWindowLongPtrA: ['ulong', ['int', 'int', 'int']],
  SetWindowPos: [
    'bool',
    ['ulong', 'ulong', 'int', 'int', 'int', 'int', 'uint'],
  ],
  SetParent: ['ulong', ['ulong', 'ulong']],
  MoveWindow: ['bool', ['ulong', 'int', 'int', 'int', 'int', 'bool']],
  GetWindowTextA: ['ulong', ['ulong', 'string', 'int']],
});

console.log(user32.FindWindowA(null, 'Electron Fiddle - 16.0.2 Unsaved').toString(16));
