const WEC_UTILS = (function () {

  function isJsonStr(str) {
    try {
      var json = JSON.parse(str);
      return (typeof json === 'object');
    } catch (e) {
      return false;
    }
  }

  return {
    isJsonStr: isJsonStr,
  }
})();

module.exports = WEC_UTILS;