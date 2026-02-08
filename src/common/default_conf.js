const WEC_DEFAULT_CONF = {
  mode: "default",
  dest_url: "", 
  storage_key: "VNET",
  access_log: true,
  xhr_log: true,
  event_log: true,
  target_list: [
    {
      selector: "a, button, img",
      event_types: ["click", "touch"]
    },
    {
      selector: "form",
      event_types: ["submit"]
    }
  ],
}

module.exports = WEC_DEFAULT_CONF;