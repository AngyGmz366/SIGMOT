// polyfills.js
if (typeof global.structuredClone !== "function") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
