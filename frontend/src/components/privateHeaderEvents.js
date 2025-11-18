import { navigate, navigateBack } from '../app/router.js';
import { logout } from '../apis/auth.js';
import { setUser } from '../app/state.js';

export function setupPrivateHeaderEvents() {
    const backBtn = document.getElementById("global-back-btn");
    const profileToggle = document.querySelector('#profileToggle');
    const dropdownMenu = document.querySelector('#dropdownMenu');

    if (!backBtn || !profileToggle || !dropdownMenu) return;

    // 뒤로가기 버튼
    backBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigateBack();
    });

    // 드롭다운 열기/닫기
    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!profileToggle.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 메뉴 클릭
    dropdownMenu.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        e.preventDefault();

        switch (action) {
            case 'logout':
                handleLogout();
                break;
            case 'edit-profile':
                navigate('/edit-profile');
                break;
            case 'edit-password':
                navigate('/edit-password');
                break;
        }
    });
}

async function handleLogout() {
  try {
    await logout();

    // 상태 초기화
    setUser(null);
    localStorage.removeItem('user');

    // 로그인 페이지로 이동
    navigate('/login');

  } catch (error) {
    console.log('로그아웃 실패:', error);
  }
}