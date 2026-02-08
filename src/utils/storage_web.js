const WEC_STORAGE_WEB = (function () {

  let _storage_key; // web storage 에 저장할 key

  //=============================================================================================
  // 외부용 함수 부분
  //=============================================================================================

  async function init (storage_key) {  
    _storage_key = storage_key;
  }

  async function load (storage_key) {
    return window.sessionStorage.getItem(storage_key);
  }

  async function save (storage_key, data) {
    window.sessionStorage.setItem(storage_key, JSON.stringify(data));
  }

  async function remove (storage_key) {
    window.sessionStorage.removeItem(storage_key);
  }

  async function getData (storage_key, attr_name) {
    const storage_info = await load(storage_key);

    return storage_info ? JSON.parse(storage_info)[attr_name] : undefined;
  }

  async function setData (storage_key, attr_name, data) {
    const storage_info = await load(storage_key);
    if (!storage_info) {
      return;
    }

    let obj = JSON.parse(storage_info);
    obj[attr_name] = data;
    window.sessionStorage.setItem(storage_key, JSON.stringify(obj));
  }

  return {
    init: init,
    load: load,
    save: save,
    remove: remove,
    setData: setData,
    getData: getData
  }
})();

module.exports = WEC_STORAGE_WEB;