const WEC_DEFAULT_CONF = require("./common/default_conf");
const WEC_HANDLER_EVENT = require("./utils/handler_event");
const WEC_HANDLER_XHR = require("./utils/handler_xhr");
const WEC_HANDLER_ACCESS = require("./utils/handler_access");
// const WEC_STORAGE_WEB = require("./utils/storage_web"); 

const WEC = (function () { 

  let _init = false;
  let _conf = {
    mode: "",
    // storage_key: "",
    access_log: false,
    xhr_log: false,
    event_log: false,
    target_list: [],
  };

  let _storageInfo = undefined;

  //=============================================================================================
  // 내부용 함수 부분
  //=============================================================================================
  
  async function init(param) {
    if (_init === true) {
      console.log("WEC is already initialized."); 
      return;
    }

    await setConfiguration(param);

    if (_conf.access_log === true) await WEC_HANDLER_ACCESS.init(_conf);
    if (_conf.xhr_log === true) await WEC_HANDLER_XHR.init(_conf);
    if (_conf.event_log === true) await WEC_HANDLER_EVENT.init(_conf);

    _init = true;
  }
  
  async function setConfiguration(param) {
    for (let i in WEC_DEFAULT_CONF) _conf[i] = WEC_DEFAULT_CONF[i];
    for (let j in param) _conf[j] = param[j];
  }

  async function listen() {
    if (_conf.access_log === true) await WEC_HANDLER_ACCESS.track();
    if (_conf.xhr_log === true) await WEC_HANDLER_XHR.listen();
    if (_conf.event_log === true) await WEC_HANDLER_EVENT.listen();
  }

  async function close() {
    if (_conf.access_log === true) await WEC_HANDLER_ACCESS.stop();
    if (_conf.xhr_log === true) await WEC_HANDLER_XHR.close();
    if (_conf.event_log === true) await WEC_HANDLER_EVENT.close();
  }

  //=============================================================================================
  // 외부용 함수 부분
  //=============================================================================================

  /**
   * 웹 이벤트 모듈 가동
   * 
   * @param {*} option
   * @desc 접속자 웹 이벤트 수집 및 전송
   */
  async function run(option) {
    await init(option);
    await listen();
    console.log("WEB EVENT COLLECTOR is now running.");
  }

  /**
   * 웹 이벤트 모듈 중단
   * 
   * @desc 웹 이벤트 수집 및 전송 중단 및 option 값 초기화
   */
  async function stop() {
    await close();
    _init = false;
    _mode = "default";
    _conf = {
      mode: "",
      // storage_key: "",
      access_log: false,
      xhr_log: false,
      event_log: false,
      target_list: [],
    };
    _storageInfo = undefined;
    
    console.log("WEB EVENT COLLECTOR is stop and closed.");
  }

  return {
    run: run,
    stop: stop,
  };
})();

if (!window.WEC) window.WEC = WEC;

if (PACKAGE_MODE === "production") WEC.run();
else if (PACKAGE_MODE === "develop") WEC.run({ mode: "debug" });
