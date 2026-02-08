2024-03-12

## 국가보훈부 제대군인 전직지원시스템(VNET) 고도화 프로젝트
### web_event_collector

### 사용자 행위이력(web_event) 수집 모듈

* 웹 페이지 접속이나 이벤트 발생을 감지하여 목적지로 전송하는 프론트엔드 모듈.
* 최초에는 vnet_event_api 와 직접 교신하려고 했으나, was의 세션 정보를 가져와야 하는 상황이 발생해서 **VNET의 WAS 서버를 거쳐감**
* 번들러: webpack5


```
root
  ├── dist
  └── src
        ├── common (설정 공통 요소)
        ├── utils  (기능)
        └── index.js (진입부)

* 원래 테스트용 static 페이지도 있었고 devServer 로 테스트 했는데,
  그냥 인터넷에 떠도는 페이지 그대로 가져온 거라 소스에서 제외함.
```

실행 : 빌드된 js 모듈 import 시 WEC 라는 전역 객체가 생성되며, WEC.run(); 으로 실행.
> ※ 현재는 모듈 import 시 별도 입력없이 바로 실행함.

옵션 : WEC.run({ mode: "debug" });
> 콘솔에 목적지로 전송한 데이터가 나타남.

중단 : WEC.stop();


※ 개발도중 VNET 서비스 페이지의 개발자도구가 막혔기 때문에 사실상 입력 불가능.


## 설정

```
> common > default_conf.js

const WEC_DEFAULT_CONF = {
  mode: "default",                    // default, debug
  dest_url: "",                       // 전송할 서버 host url
  storage_key: "VNET",                // 웹 스토리지 키 (미활용)
  access_log: true,                   // 접속 감지 활성화
  xhr_log: true,                      // ajax 등 비동기호출 감지 활성화 
  event_log: true,                    // click 등 이벤트 감지 활성화
  target_list: [                      // 이벤트 감지시 수집 대상 element 
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

...

```

> 해당 옵션들은 사실 WEB.run() 호출시 옵션으로 변경이 가능.

예시) 

```
WEC.run({
  access_log: false,
  xhr_log: false, 
  event_log: true,
  target_list: [ 
    {
      selector: "a.select_btn",
      event_types: ["click"]
    }
  ]
});
```


## 기능

```
└─ utils
    ├── handler_access.js             // 방문자 접속 감지 및 전송
    ├── handler_event.js              // 이벤트 발생 감지 및 전송
    ├── handler_xhr.js                // 비동기 호출 감지 및 전송
    └── storage_web.js                // 웹 스토리지 활용 (미사용)

* storage_web.js 는 세션 스토리지를 활용할 목적으로 만들었는데, was 서버의
  세션을 활용하게 되면서 미사용하게 됨.
* 허나 나중에 누군가 쿠기나 웹 스토리지 저장 정보 활용시 자신에게 맞게
  수정해서 활용하는 것도 나쁘지 않다고 생각함.
```

### handler_access.js

* js 모듈이 import 된 페이지에 접속 정보(기기, OS, 브라우저, referer 등)및 페이지를 떠난 정보(머문 시간 등)를 감지 및 수집하여 목적지로 전송함.
* DOMContentLoaded, unload 이벤트가 활용됨.
* unload 혹은 beforeunl;oad 이벤트 등의 페이지를 벗어나기 전 이벤트의 경우, 페이지 이동은 그대로 발생하는 사이에 전송이 이뤄지기 때문에, 처리시간이 오래 걸리면 페이지 이동이 먼저 일어나 전송되지 않는 일이 발생하기도 한다.

예시)

```
다른 페이지 클릭 -> 페이지 이동
                 -> unload 감지 -> 떠난 정보 전송 
                 -> 클릭 이벤트 감지 -> 이벤트 정보 전송
```

기본적으로 async 방식이며, 서비스 및 페이지마다 어떤 게 먼저 일어난다는 보장이 없기 때문에(심지어 같은 페이지라도 브라우저마다 다름) unload 이벤트시에는 처리 시간이 페이지 이동 시간을 넘지 않도록 주의가 필요.

### handler_event.js

* 모듈이 import 된 target_list 에 지정된 대상에 이벤트 리스너를 부여하여 목적에 맞는 정보를 전송함.
* event 정보를 모두 가져오는 건 당연히 무리가 있기 때문에, 기본적으로는 DOM 내 node_path 와 selector 정도만 나타나는 게 기본이고, click 이벤트면 a 태그일 때 href 속성 정도를 추가적으로 수집함. 그 외의 큰 특징은 없고 그 외 다른 정보를 뽑으려면 js 파일 내에서 각 이벤트마다 커스터마이징이 필요함.
* mutation 을 활용하여 DOM 변경도 감지하여 element 가 동적으로 추가된 경우에도 리스너를 부여함.

### handler_xhr.js

* XmlHttpRequest, ajax, axios 등 비동기 호출을 감지하여 수집함.
  > 이 때문에 목적지로의 전송은 fetch API 가 사용됨.
* 수집하려는 페이지가 비동기 호출을 fetch API로 하고 있고 이를 수집하려면, 새로 만들어야 함. xhr 과 fetch 둘 다 수집하는 것은 무한 루프가 발생할 것이므로 배제함.
  > target_list 처럼 수집할 request url 을 설정에서 지정하면 되긴 함. 대신 그걸 설정에 다 때려넣는 것도 고민해볼 문제임.
* reponse 전체를 수집하는 것은 너무 양이 많아서 제외됨.
* request 형태가 의외로 생각보다 다 제각각이므로 가능한 한 예외처리는 했지만 전부는 보장 힘듦. 또한 처리 시간도 문제.
  > formData 그대로 보내는 곳도 있고, serialize 해서 한줄로 만들어서 보내는 곳도 있고, json 으로 보내는 곳도 있음.
* FormData 인 경우, password 와 file 은 보안 및 용량 문제로 제외했지만, 그냥 json 이나 serialize 인 경우는 뭐가 password 인지 file 인지 알 수 없어서 어쩔 수 없이 nonTarget 으로 수집 제외 대상 설정함. 그러나 썩 깔끔한 방식으로 적용하진 못함.
* 페이지 이동 전에(unload 이벤트 발생시) 수집되어야 할 비동기 호출이 있다면 전송이 목적지로 잘 도달하는지 반드시 테스트해볼 것을 권장함.