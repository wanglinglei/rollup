function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

module.exports = {
  hasOwn,
};
