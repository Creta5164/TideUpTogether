# TideUp Together

<p align="center">
  <img alt="TideUp Together - It's dangerous to go alone! Take this." width="640" src="./og-image.png"/>
</p>

### [모드 다운로드](https://github.com/Creta5164/TideUpTogether/releases)

Gustav님의 게임인 [TideUp](https://store.steampowered.com/app/1890520)의 동기 및 비동기 멀티플레이 모드입니다.

> 이 프로젝트는 완전히 정돈 된 상태가 아닙니다, 아래의 필요한 작업들 항목을 확인해주세요.  
기여는 언제든지 환영입니다!

---

## 클라이언트 모드 설치하는 법

1. Releases 탭에서 `TideUpTogether.zip`을 받습니다.
2. 안에 있는 `www` 폴더를 게임이 설치된 동명의 폴더에 덮어써줍니다.
3. 게임을 실행해서 좌측 상단에 연결 상태(`온라인`, `오프라인`)가 표시되는 지 확인합니다.

## 서버 호스팅 하는 법

아는 사람들끼리 하고 싶다면, 여기 자체 호스팅을 하는 방법이 있습니다.

1. Releases 탭에서 `TideUpTogetherServer.zip`을 받습니다.
2. 각 플랫폼(Windows, MacOS, Linux 등)에 맞는 서버 프로그램을 찾습니다.
3. `appsettings.json`를 열어 서버 설정을 구성한 뒤, 터미널(cmd 등)에서 서버를 실행합니다.

클라이언트에서 해당 서버에 연결하려면 `www/js/plugins/TideUpTogether.js`의 첫번째 줄에서 주소에 해당하는 부분(따옴표로 쳐진 부분)을 연결하고 싶은 IP나 도메인으로 수정하세요.

```
var Address = '127.0.0.1';
```

기본 포트는 `14522`입니다.

# 빌드

클라이언트(`TideUpTogether.js`)는 해당 게임의 기반인 RPG 만들기 MV 특성 상 번들링과 같은 과정을 거치지 않고 바로 사용합니다.

서버를 빌드하려면 .NET SDK(6.0 이상)가 필요합니다.

터미널에서 `TideUpTogetherServer` 디렉토리로 이동한 후, 아래의 명령을 통해 빌드할 수 있습니다.

```
dotnet publish -c Release -r <RID> -p:PublishSingleFile=true
```
`<RID>`는 [런타임 식별자](https://docs.microsoft.com/ko-kr/dotnet/core/rid-catalog)입니다.

빌드 결과물은 `bin/Release`에서 찾을 수 있습니다.

### Windows
```
dotnet publish -c Release -r win-x64 -p:PublishSingleFile=true
```

### Linux
```
dotnet publish -c Release -r linux-x64 -p:PublishSingleFile=true
```

### MacOS
```
dotnet publish -c Release -r osx-x64 -p:PublishSingleFile=true
```

---

# 필요한 작업들 (TODO)

이 모드 프로젝트는 아이디어를 빠르게 구축하여 만들었기 때문에, 여러 방면에서 최적화 되지 않거나 정돈되지 않은 부분들이 있습니다.

- [ ] 다국어 지원  
  이것은 `TideUpTogether-strings.js`의 다른 언어 버전을 만들어 해결할 수 있습니다.  
  해당 스크립트에는 텍스트와 관련된 데이터가 정리되어 있습니다.

- [ ] 패킷 송수신 최적화  
  현재 서버는 클라이언트가 보내주는대로 서버가 같은 맵에 있는 클라이언트에 방송하는 식으로 동작합니다.  
  이는 프레임 단위로 작동하기에, 연결 된 클라이언트가 많을수록 병목이 심해질 것으로 예상됩니다.