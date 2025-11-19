import { navigate } from '../app/router.js';
import { checkEmail, checkNickname, uploadProfileImage, signup } from '../apis/user.js';

let signupForm;
let emailInput, passwordInput, confirmPasswordInput, nicknameInput;
let profileInput, profilePreview;
let emailHelper, passwordHelper, passwordConfirmHelper, nicknameHelper, profileHelper;
let signupBtn, toLoginBtn;

let isValidEmail = false;
let isValidPassword = false;
let isValidConfirmPassword = false;
let isValidNickname = false;
let profileImageUrl = null;

export function SignupView() {
  return `
    <main class="page-signup">
      <section class="signup-card">

        <h2 class="signup-title">회원가입</h2>

        <!-- 프로필 사진 업로드 -->
        <div class="signup-profile">
          <label>프로필 사진*</label>

          <div class="profile-preview">
            <span class="plus-icon">+</span>
          </div>

          <input type="file" class="profile-input" accept="image/*" hidden />
          <p class="helper-text profile-helper"></p>
        </div>

        <!-- 회원가입 폼 -->
        <form class="signup-form">

          <div class="form-group">
            <label for="signup-email">이메일*</label>
            <input id="signup-email" type="email" class="input-field" placeholder="이메일을 입력하세요" />
            <p class="helper-text email-helper"></p>
          </div>

          <div class="form-group">
            <label for="signup-password">비밀번호*</label>
            <input id="signup-password" type="password" class="input-field" placeholder="비밀번호를 입력하세요" />
            <p class="helper-text password-helper"></p>
          </div>

          <div class="form-group">
            <label for="signup-password-confirm">비밀번호 확인*</label>
            <input id="signup-password-confirm" type="password" class="input-field" placeholder="비밀번호를 한 번 더 입력하세요" />
            <p class="helper-text password-confirm-helper"></p>
          </div>

          <div class="form-group">
            <label for="signup-nickname">닉네임*</label>
            <input id="signup-nickname" type="text" class="input-field" placeholder="닉네임을 입력하세요" />
            <p class="helper-text nickname-helper"></p>
          </div>

          <button type="submit" class="btn btn-primary signup-btn" disabled>회원가입</button>
          <button type="button" class="btn btn-text btn-to-login">로그인하러 가기</button>

        </form>

      </section>
    </main>
  `;
}

SignupView.setup = function () {
  // 폼 & 입력 요소
  signupForm = document.querySelector('.signup-form');

  emailInput = document.getElementById('signup-email');
  passwordInput = document.getElementById('signup-password');
  confirmPasswordInput = document.getElementById('signup-password-confirm');
  nicknameInput = document.getElementById('signup-nickname');

  // 프로필 업로드
  profileInput = document.querySelector('.profile-input');
  profilePreview = document.querySelector('.profile-preview');

  // 헬퍼 텍스트
  emailHelper = document.querySelector('.email-helper');
  passwordHelper = document.querySelector('.password-helper');
  passwordConfirmHelper = document.querySelector('.password-confirm-helper');
  nicknameHelper = document.querySelector('.nickname-helper');
  profileHelper = document.querySelector('.profile-helper');

  // 버튼
  signupBtn = document.querySelector('.signup-btn');
  toLoginBtn = document.querySelector('.btn-to-login');

  // 상태 초기화
  isValidEmail = false;
  isValidPassword = false;
  isValidConfirmPassword = false;
  isValidNickname = false;
  profileImageUrl = null;

  // 이벤트 바인딩
  signupForm.addEventListener('submit', handleSignup);
  emailInput.addEventListener('blur', handleEmailCheck);
  passwordInput.addEventListener('blur', handlePasswordCheck);
  confirmPasswordInput.addEventListener('blur', handlePasswordConfirm);
  nicknameInput.addEventListener('blur', handleNicknameCheck);

  profilePreview.addEventListener('click', () => profileInput.click());
  profileInput.addEventListener('change', handleProfileImageUpload);

  toLoginBtn.addEventListener('click', () => navigate('/login'));
};

// 추후 분리

/* --------------------------------------
 * 회원가입 처리
 * -------------------------------------- */
async function handleSignup(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput.value.trim();

  if (!profileImageUrl) {
    profileHelper.textContent = '* 프로필 사진을 추가해주세요.';
    return;
  }

  if (!isValidEmail || !isValidPassword || !isValidConfirmPassword || !isValidNickname) {
    return;
  }

  try {
    await signup(email, password, nickname, profileImageUrl);
    // 회원가입 성공 후 로그인 페이지로 이동
    navigate('/login');
  } catch (error) {
    console.error('회원가입 실패: ', error);
    // 필요하면 토스트/에러 메시지 표시
  }
}

/* --------------------------------------
 * 이메일 검증 + 중복 체크
 * -------------------------------------- */
async function handleEmailCheck() {
  const email = emailInput.value.trim();

  if (!email) {
    emailHelper.textContent = '* 이메일을 입력해주세요.';
    isValidEmail = false;
    updateSubmitButtonState();
    return;
  }

  if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/.test(email)) {
    emailHelper.textContent = '* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
    isValidEmail = false;
    updateSubmitButtonState();
    return;
  }

  try {
    const { isAvailable } = await checkEmail(email);
    if (!isAvailable) {
      emailHelper.textContent = '* 중복된 이메일입니다.';
      isValidEmail = false;
    } else {
      emailHelper.textContent = '';
      isValidEmail = true;
    }
  } catch (error) {
    console.error(error);
    isValidEmail = false;
  }

  updateSubmitButtonState();
}

/* --------------------------------------
 * 비밀번호 검증
 * -------------------------------------- */
function handlePasswordCheck() {
  const password = passwordInput.value.trim();

  if (!password) {
    passwordHelper.textContent = '* 비밀번호를 입력해주세요.';
    isValidPassword = false;
  } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,20}$/.test(password)) {
    passwordHelper.textContent = '* 비밀번호는 8~20자이며, 영문 + 숫자를 포함해야 합니다.';
    isValidPassword = false;
  } else {
    passwordHelper.textContent = '';
    isValidPassword = true;
  }

  // 비밀번호가 바뀌면 확인 값도 다시 체크
  handlePasswordConfirm();
  updateSubmitButtonState();
}

/* --------------------------------------
 * 비밀번호 확인 검증
 * -------------------------------------- */
function handlePasswordConfirm() {
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if (!confirmPassword) {
    passwordConfirmHelper.textContent = '* 비밀번호를 한번 더 입력해주세요.';
    isValidConfirmPassword = false;
  } else if (password !== confirmPassword) {
    passwordConfirmHelper.textContent = '* 비밀번호가 다릅니다.';
    isValidConfirmPassword = false;
  } else {
    passwordConfirmHelper.textContent = '';
    isValidConfirmPassword = true;
  }

  updateSubmitButtonState();
}

/* --------------------------------------
 * 닉네임 검증 + 중복 체크
 * -------------------------------------- */
async function handleNicknameCheck() {
  const nickname = nicknameInput.value.trim();

  if (!nickname) {
    nicknameHelper.textContent = '* 닉네임을 입력해주세요.';
    isValidNickname = false;
    updateSubmitButtonState();
    return;
  }

  if (nickname.includes(' ')) {
    nicknameHelper.textContent = '* 띄어쓰기를 없애주세요.';
    isValidNickname = false;
    updateSubmitButtonState();
    return;
  }

  if (nickname.length > 10) {
    nicknameHelper.textContent = '* 닉네임은 최대 10자까지 작성 가능합니다.';
    isValidNickname = false;
    updateSubmitButtonState();
    return;
  }

  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    nicknameHelper.textContent = '* 닉네임은 한글, 영어, 숫자만 사용할 수 있습니다.';
    isValidNickname = false;
    updateSubmitButtonState();
    return;
  }

  try {
    const { isAvailable } = await checkNickname(nickname);
    if (!isAvailable) {
      nicknameHelper.textContent = '* 중복된 닉네임입니다.';
      isValidNickname = false;
    } else {
      nicknameHelper.textContent = '';
      isValidNickname = true;
    }
  } catch (error) {
    console.error(error);
    isValidNickname = false;
  }

  updateSubmitButtonState();
}

/* --------------------------------------
 * 프로필 이미지 업로드 & 미리보기
 * -------------------------------------- */
async function handleProfileImageUpload(e) {
  const image = e.target.files[0];

  if (!image) {
    profileImageUrl = null;
    profileHelper.textContent = '* 프로필 사진을 추가해주세요.';
    profilePreview.style.backgroundImage = '';
    profilePreview.innerHTML = '<span class="plus-icon">+</span>';
    updateSubmitButtonState();
    return;
  }

  const formData = new FormData();
  formData.append('image', image);

  try {
    const body = await uploadProfileImage(formData);

    profileHelper.textContent = '';
    profileImageUrl = body?.imageUrl ?? null;

    if (profileImageUrl) {
      profilePreview.style.backgroundImage = `url(${profileImageUrl})`;
      const plus = profilePreview.querySelector('.plus-icon');
      if (plus) plus.remove();
    }
  } catch (error) {
    console.error(error);
    alert('업로드에 실패했습니다. 다시 시도해주세요.');
    profileImageUrl = null;
  }

  updateSubmitButtonState();
}

/* --------------------------------------
 * 회원가입 버튼 활성화 상태 갱신
 * -------------------------------------- */
function updateSubmitButtonState() {
  const allValid =
    isValidEmail &&
    isValidPassword &&
    isValidConfirmPassword &&
    isValidNickname &&
    profileImageUrl !== null;

  if (allValid) {
    signupBtn.disabled = false;
    signupBtn.classList.add('active');
  } else {
    signupBtn.disabled = true;
    signupBtn.classList.remove('active');
  }
}
