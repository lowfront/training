const { execSync } = require('child_process');
const ffi = require('ffi-napi');
const ref = require('ref-napi');

function TEXT (text) {
  return Buffer.from(text + "\0", "ucs2");
}

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

const sleep = ms => new Promise(res => setTimeout(res, ms));
const main = async () => {
  execSync('C:/Users/jacol/Downloads/cn1/BL43703-i_03.jpg');
  let hwnd;
  while (!hwnd) {
    hwnd = user32.FindWindowA('ApplicationFrameWindow', 'BL43703-i_03.jpg - 사진');
    await sleep(100);
  }
  console.log(hwnd.toString(16));
  user32.SetWindowPos(hwnd, null, 0, 0, 100,400, 0x0040);
};
// main();
// user32.MoveWindow(0x270776, 0, 0, 300, 300, 1);
// const buf = Buffer.from(Array(30));
// user32.GetWindowTextA(0x002211F8, buf.ref(), 30);
// console.log(buf);
// console.log(TEXT('BL43703-i_03.jpg - 사진'));
console.log(user32.FindWindowA(null, 'Electron Fiddle - 16.0.2 Unsaved').toString(16));
