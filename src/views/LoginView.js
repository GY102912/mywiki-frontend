import { navigate } from '../app/router.js';
import { setUser } from '../app/state.js';
import { login } from '../apis/auth.js';
import { getProfile } from '../apis/user.js';

let emailInput, passwordInput;
let emailHelper, passwordHelper;

let isValidEmail = false;
let isValidPassword = false;

export function LoginView() {
  return `
  <script type="module" src="../pages/login/login.js"></script>
  <main class="login-container">
    <section class="login-card">
      <h2 class="login-title">로그인</h2>

      <form class="form login-form">
        <!-- 이메일 입력 -->
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            type="email"
            class="input-field"
            placeholder="이메일을 입력하세요"
          />
          <p class="helper-text email-helper"></p>
        </div>

        <!-- 비밀번호 입력 -->
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            type="password"
            class="input-field"
            placeholder="비밀번호를 입력하세요"
          />
          <p class="helper-text password-helper"></p>
        </div>

        <button type="submit" class="btn btn-primary">로그인</button>
        <button type="button" class="btn btn-text">회원가입</button>
      </form>
      
    </section>
  </main>
  `;
}

LoginView.setup = function () {
  const form = document.querySelector('.login-form');

  emailInput = document.querySelector('#email');
  passwordInput = document.querySelector('#password');

  emailHelper = document.querySelector('.email-helper');
  passwordHelper = document.querySelector('.password-helper');

  // 이벤트 바인딩
  form.addEventListener('submit', handleSubmit);
  emailInput.addEventListener('blur', validateEmailField);
  passwordInput.addEventListener('blur', validatePasswordField);

  document.querySelector('.btn-text')
    .addEventListener('click', () => navigate('/signup'));
};

// 추후 분리
function validateEmailField() {
  const email = emailInput.value.trim();
  const message = validateEmail(email);
  emailHelper.textContent = message || '';
  isValidEmail = !message;
}

function validateEmail(email) {
  if (!email) return '* 이메일을 입력해주세요.';
  return null;
}

function validatePasswordField() {
  const password = passwordInput.value.trim();
  const message = validatePassword(password);
  passwordHelper.textContent = message || '';
  isValidPassword = !message;
}

function validatePassword(password) {
  if (!password) return '* 비밀번호를 입력해주세요.';
  return null;
}

async function handleSubmit(e) {
  e.preventDefault();

  validateEmailField();
  validatePasswordField();

  if (!isValidEmail || !isValidPassword) return;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    await login(email, password);
    const user = await getProfile();
    setUser(user);
    navigate('/boards/main');

  } catch (error) {
    passwordHelper.textContent = '* 아이디 또는 비밀번호를 확인해주세요.';
    console.error('로그인 실패:', error);
  }
}
