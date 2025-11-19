import { state } from './state.js';

import { renderPublicHeader } from '../components/publicHeader.js';
import { renderPrivateHeader } from '../components/privateHeader.js';
import { setupPrivateHeaderEvents } from '../components/privateHeaderEvents.js';

import { LoginView } from '../views/LoginView.js';
import { SignupView } from '../views/SignupView.js';
import { MainBoardView } from '../views/MainBoardView.js';
import { PostDetailView } from '../views/PostDetailView.js';
import { CreatePostView } from '../views/CreatePostView.js';
import { EditPostView } from '../views/EditPostView.js';
import { EditProfileView } from '../views/EditProfileView.js';
import { EditPasswordView } from '../views/EditPasswordView.js';

const routes = {
  '/login': {
    view: LoginView,
    auth: false,
    header: 'public',
  },
  '/signup': {
    view: SignupView,
    auth: false,
    header: 'public',
  },
  '/boards/main': {
    view: MainBoardView,
    auth: true,
    header: 'private',
  },
  '/posts': {
    view: PostDetailView,
    auth: true,
    header: 'private',
  },
  '/create-post': {
    view: CreatePostView,
    auth: true,
    header: 'private',
  },
  '/edit-post': {
    view: EditPostView,
    auth: true,
    header: 'private',
  },
  '/edit-profile': {
    view: EditProfileView,
    auth: true,
    header: 'private',
  },
  '/edit-password': {
    view: EditPasswordView,
    auth: true,
    header: 'private',
  },
};

let routeParams = {};

export function navigate(path, params = {}) {
  routeParams = params;
  window.history.pushState({}, '', path);
  renderRoute(path);
}

export function initRouter() {
  window.addEventListener('popstate', () => {
    renderRoute(location.pathname);
  });

  renderRoute(location.pathname);
}

function renderRoute(path) {
  if (!routes[path]) {
    path = '/login';
  }
  const route = routes[path];

  // 🔒 인증 필요한 페이지인데 로그인 안 됨
  if (route.auth && !state.user) {
    return navigate('/login');
  }

  // 🔥 body 클래스 페이지 단위로 적용
  document.body.className = '';  
  const className = `page-${path.replace('/', '')}`;
  document.body.classList.add(className);

  // 🧱 헤더 렌더링
  if (route.header === 'public') {
    document.querySelector('#header').innerHTML = renderPublicHeader();
  } else {
    document.querySelector('#header').innerHTML = renderPrivateHeader(state.user);
    setupPrivateHeaderEvents();
  }

  // 🧱 페이지 렌더링
  document.querySelector('#app').innerHTML = route.view();

  // ⚙️ 페이지 전용 setup() 실행
  if (route.view.setup) {
    route.view.setup(routeParams);
  }
}

export function navigateBack() {
  history.back();
}
