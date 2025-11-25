# Community

## 개요

**Community**는 사람들과 온라인으로 자유롭게 소통하고 싶은 사용자를 위한 **커뮤니티 서비스**입니다.

게시글 작성, 댓글 작성, 게시글 좋아요를 통해 내 이야기를 나누고 다른 사용자의 이야기에 공감해보세요.

## 기능

- 백엔드 API와 연동하여 게시글, 댓글 작성 및 조회와 게시글 좋아요 기능 제공
- Vanilla JavaScript 기반의 SPA(Single Page Application) 아키텍처 적용
- 모달, 드롭다운, 토스트 메시지 등의 인터랙션 컴포넌트 사용

## 디렉토리 구조

```yaml
src/
├── app/              # 앱 전역 상태 관리 메서드, 커스텀 라우터
├── apis/             # HTTP 요청 유틸과 백엔드 API 연동 비동기 메서드들
├── components/       # 모달, 드롭다운 등 UI 컴포넌트
├── views/            # SPA 페이지들
├── styles/           # CSS 파일들
├── assets/           # 이미지 파일들
├── util/             # 유틸 메서드들
├── main.js           # 앱 엔트리 포인트
├── style.css         # 공통 CSS 설정 파일
└── index.html        # SPA 페이지들의 기본 구조
```

## 로컬 실행 방법

1. 저장소 클론
    
    ```bash
    git clone https://github.com/GY102912/mywiki-frontend.git
    cd mywiki-frontend
    ```
    
2. 패키지 설치
    
    ```bash
    npm install
    ```
    
3. 로컬 실행
    
    ```bash
    npm run dev
    ```
    

## 의존성

- Vanilla JavaScript (ES6+)
- HTML/CSS
- Vite (개발 환경 및 빌드)
