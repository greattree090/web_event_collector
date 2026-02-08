const WEC_HANDLER_EVENT = (function () {

  let _mode = '';
  let _server_url = '';
  let _target_list = [];
  // let _storage_key = '';
  let _observer = undefined;

  //=============================================================================================
  // 내부용 함수 부분
  //=============================================================================================

  async function setConf(conf) {
    _mode = conf.mode;
    _server_url = conf.dest_url;
    _target_list = conf.target_list
    // _storage_key = conf.storage_key;
  }

  function getNodePath (el) {
    var path = [];

    while (
      (el.nodeName.toLowerCase() != 'html') && 
      (el = el.parentNode) &&
      path.unshift(el.nodeName.toLowerCase() + 
        (el.id ? '#' + el.id : '') + 
        (el.className ? '.' + el.className.replace(/\s+/g, ".") : ''))
    );
    return path.join(" > ");
  }

  function getSelector (el) {
    return el.nodeName.toLowerCase() + 
    (el.id ? '#' + el.id : '') + 
    (el.className ? '.' + el.className.replace(/\s+/g, ".") : '')
  }

  async function getEventInfo (event) {
    return ({
      click: async function(event) {

        const info = {
          target_el: getSelector(event.target),
          node_path: getNodePath(event.target),
          content: event.target.innerText,
        }
        if (event.target.nodeName.toLowerCase() === "a") {
          info["href"] = event.target.getAttribute("href");
        }

        return info;
      },
      submit: async function(event) {
        const form = new FormData(event.target);
        const info = {
          target_el: getSelector(event.target),
          node_path: getNodePath(event.target),
          method: event.target.getAttribute("method"),
          action: event.target.getAttribute("action"),
          data: Object.fromEntries(
            Array.from(form.entries()).filter(([name, _]) =>
              form.get(name).type !== 'password' ||
              form.get(name).type !== 'file'
            )
          )
        }

        return info;
      }
    }[event.type] || async function (event) {
      const info = {
        target_el: getSelector(event.target),
        node_path: getNodePath(event.target),
      }
      return info;
    })(event);
  }

  async function sendEventLog (event) {
    // event.stopPropagation();
    // event.stopImmediatePropagation();
    const { type } = event;
    const payload = {
      action: type,
      url: window.location.href,
      event_info: await getEventInfo(event),
    }

    if (
      event.target.nodeName.toLowerCase() === "a" ||
      event.target.nodeName.toLowerCase() === "form"
    ) {
      event.preventDefault();
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
    .then(function () {
      if (event.target.nodeName.toLowerCase() === "a") {
        const dest = event.target.getAttribute("href");
        if (dest) window.location = event.target.getAttribute("href");
      }
      if (event.target.nodeName.toLowerCase() === "form") {
        const dest = event.target.getAttribute("action");
        if (dest) event.target.submit();
      }
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

  async function addListener() {
    _target_list.forEach(async function (target_el) {
      if (target_el.selector) {
        target_el.event_types.forEach(async function (type) {
          document.querySelectorAll(target_el.selector).forEach(function (selectedEl) {
            selectedEl.addEventListener(type, sendEventLog, false);
          });
        });
      }
      else {  
        target_el.event_types.forEach(function (type) {
          window.addEventListener(type, sendEventLog, false);
        });
      }
    });
  }

  async function removeListner() {
    _target_list.forEach(function (target_el) {
      if (target_el.selector) {
        target_el.event_types.forEach(function (type) {
          document.querySelectorAll(target_el.selector).forEach(function (selectedEl) {
            selectedEl.removeEventListener(type, sendEventLog, false);
          });
        });
      }
      else {  
        target_el.event_types.forEach(function (type) {
          window.removeEventListener(type, sendEventLog, false);
        });
      }
    });
  }

  async function detectDomChange() {
    _observer = new MutationObserver(async function (mutation) {
      await addListener();
    });

    const body = document.querySelector("body");
    const options = {
      childList : true,
      subtree : true,
    }

    _observer.observe(body, options);
  }

  async function stopDetectDomChange() {
    _observer.disconnect();
    _observer = undefined;
  }

  //=============================================================================================
  // 외부용 함수 부분
  //=============================================================================================

  async function init(conf) {
    await setConf(conf);
  }

  async function listen () {
    window.onload = async function() {
      await addListener();
      await detectDomChange();
    }
  }

  async function close () {
    await removeListner();
    await stopDetectDomChange();
  }

  return {
    init: init,
    listen: listen,
    close: close
  }
})();

module.exports = WEC_HANDLER_EVENT;