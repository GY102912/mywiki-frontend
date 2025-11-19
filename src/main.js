import { initRouter } from './app/router.js';
import { setupModalEvents } from './components/modal.js';

// 앱 초기 시작점
window.addEventListener('DOMContentLoaded', () => {
  setupModalEvents(); // 앱 전체에서 단 1번만 실행
  initRouter();
});
