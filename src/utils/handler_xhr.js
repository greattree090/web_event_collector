// const WEC_STORAGE_WEB = require("./utils/storage_web"); 
const { isJsonStr } = require("./common_utils");

const WEC_HANDLER_XHR = (function () {
  
  let _mode = '';
  let _server_url = '';
  // let _storage_key = '';

  let _org_open = undefined;
  let _org_send = undefined;

  const nonTarget = ["pwd", "pwd1", "pwd2"];

  //=============================================================================================
  // 내부용 함수 부분
  //=============================================================================================

  async function setConf(conf) {
    _mode = conf.mode;
    _server_url = conf.dest_url;
    // _storage_key = conf.storage_key;
  }

  function reqDataToJson(arg) {
    if (!arg) return;
    else if (isJsonStr(arg)) return JSON.parse(arg);
    else if (arg instanceof FormData) {
      return Object.fromEntries(
        Array.from(arg.entries()).filter(([name, _]) => 
          arg.get(name).type !== 'password' ||
          arg.get(name).type !== 'file'
        )
      );
    }
    else if (typeof arg === "object") return arg;
    else if (typeof arg === "string") {
      const pairs = arg.split("&");
      let result = {};
      pairs.forEach(function (p) {
        if (p.indexOf("=") < 0) return;

        var pair = p.split('=');
        var key = pair[0];
        var value = pair[1];
        result[key] = value;
      })
      return result;
    }
  }

  async function addXHRListenr() {
    // Overrinding
    !function(open) {
      _org_open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url) {
        let xhr = this;
        xhr.method = method;

        open.call(this, method, url);
      }
    }(XMLHttpRequest.prototype.open);

    // Overrinding
    !function(send) {
      _org_send = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function (data) {
        let xhr = this;

        // Overriding 
        xhr.onreadystatechange = function() {
          let req_info = {};
          if (xhr.readyState == XMLHttpRequest.DONE) {
            req_info["method"] = xhr.method;
            req_info["target_url"] = xhr.responseURL;
            req_info["status"] = xhr.status;
            req_info["body"] = reqDataToJson(data);
            nonTarget.forEach(function (t) {
              if (req_info["body"] && req_info["body"][t]) delete req_info["body"][t];
            })
            // 2024.01.23. response 감지에서 제외.
            // req_info["response"] = isJsonStr(xhr.responseText) ? JSON.parse(xhr.responseText) : {"entire_text": xhr.responseText};
            
            // // detect Login & Logout
            // if ( 
            //   req_info.target_url === "/gc/GcCmnS001E002.do" && 
            //   req_info.status === 200 &&
            //   !req_info.resultMap.errorCode
            // ) {
            //   // 로그인 감지시 동작  
            // }
            // if (req_info.target_url === "/gc/GcCmnM002E002Logout.do" && req_info.status === 200) { // detect Logout
            //   await WEC_STORAGE_WEB.remove(_storage_key);
            // }
            
            sendXHRInfo(req_info);
          }
        }
        send.call(this, data);
      }
    }(XMLHttpRequest.prototype.send);
  }

  async function sendXHRInfo(req_info) {

    const payload = {
      action: "XMLHttpRequest", 
      url: window.location.href,
      xhr_info: req_info
    }

    if (_mode === "debug") {
      console.info("payload:", payload);
    }

    await fetch(`${_server_url}/log/WebLog001.do`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    // .then(response => response.json())
    // .then((data) => {
    //   if (_mode === "debug") {
    //     console.info("success:", data);
    //   }
    // })
    // .catch((error) => {
    //   if (_mode === "debug") {
    //     console.error('error:', error);
    //   }
    // });
  }

  async function removeXHRListenr() {
    // Rollback
    XMLHttpRequest.prototype.open = _org_open;
    XMLHttpRequest.prototype.send = _org_send;
    _org_open, _org_send = undefined;
  }

  //=============================================================================================
  // 외부용 함수 부분
  //=============================================================================================

  async function init(conf) {
    await setConf(conf);
  }

  async function listen () {
    await addXHRListenr();
  }

  async function close () {
    await removeXHRListenr();
  }

  return {
    init: init,
    listen: listen,
    close: close
  }
})();

module.exports = WEC_HANDLER_XHR;