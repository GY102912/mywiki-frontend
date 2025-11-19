import { 
  checkNickname, 
  uploadProfileImage, 
  getProfile, 
  editProfile, 
  signout 
} from '../apis/user.js';
import { state, setUser } from '../app/state.js';
import { navigate } from '../app/router.js';
import { showToast } from "../util/toast.js";

/* ------------------------------
 * View 함수
 * ------------------------------ */
export function EditProfileView() {
  return `
    <main class="page-edit-profile">
        <section class="edit-card">

        <h2 class="edit-title">회원정보 수정</h2>

        <!-- 프로필 섹션 -->
        <div class="profile-section">
            <label class="profile-label">프로필 사진</label>
            <p class="helper-text profile-helper"></p>

            <div class="profile-preview">
                <button class="edit-photo-btn">변경</button>
            </div>
            <input type="file" class="profile-input" accept="image/*" hidden />
        </div>

        <form class="edit-form">

            <div class="form-group">
            <label for="edit-email">이메일</label>
            <input id="edit-email" type="email" class="input-field" readonly />
            </div>

            <div class="form-group">
            <label for="edit-nickname">닉네임</label>
            <input id="edit-nickname" type="text" class="input-field" />
            <p class="helper-text nickname-helper"></p>
            </div>

            <button type="submit" class="btn btn-primary edit-btn" disabled>수정하기</button>
            <button type="button" class="btn btn-text delete-btn">회원 탈퇴</button>

            <!-- 탈퇴 모달 -->
            <div class="modal delete-modal">
            <div class="modal-content">
                <h3>회원탈퇴 하시겠습니까?</h3>
                <p>작성된 게시글과 댓글은 삭제됩니다.</p>
                <div class="modal-actions">
                <button class="btn cancel">취소</button>
                <button class="btn confirm">확인</button>
                </div>
            </div>
            </div>

        </form>

        </section>
    </main>
  `;
}

/* ------------------------------
 * Setup 함수
 * ------------------------------ */
EditProfileView.setup = function () {
  /* DOM 참조 */
  const emailInput = document.querySelector('#edit-email');
  const nicknameInput = document.querySelector('#edit-nickname');
  const nicknameHelper = document.querySelector('.nickname-helper');

  const profilePreview = document.querySelector('.profile-preview');
  const profileInput = document.querySelector('.profile-input');
  const profileHelper = document.querySelector('.profile-helper');
  const editPhotoBtn = document.querySelector('.edit-photo-btn');

  const editBtn = document.querySelector('.edit-btn');
  const deleteBtn = document.querySelector('.delete-btn');

  const modal = document.querySelector('.delete-modal');
  const cancelBtn = modal.querySelector('.cancel');
  const confirmBtn = modal.querySelector('.confirm');

  /* 초기 렌더링 */
  loadUserProfile(emailInput, nicknameInput, profilePreview);

  /* 이벤트 등록 */
  nicknameInput.addEventListener('blur', () =>
    validateNickname(nicknameInput, nicknameHelper, editBtn)
  );

  editPhotoBtn.addEventListener('click', () => profileInput.click());
  profileInput.addEventListener('change', (e) =>
    handleProfileImageUpload(e, profilePreview, profileHelper)
  );

  document.querySelector('.edit-form').addEventListener('submit', (e) =>
    handleSubmit(e, nicknameInput, editBtn)
  );

  deleteBtn.addEventListener('click', () => (modal.style.display = 'flex'));
  cancelBtn.addEventListener('click', () => (modal.style.display = 'none'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });
  confirmBtn.addEventListener('click', () => handleDelete(modal));
};

/* ===========================================================
   아래는 setup() 바깥으로 빠진 로직들
   =========================================================== */

/* ------------------ 프로필 불러오기 ------------------ */
async function loadUserProfile(emailInput, nicknameInput, profilePreview) {
  try {
    const user = await getProfile();

    setUser(user);

    emailInput.value = user.email;
    nicknameInput.value = user.nickname;

    if (user.profileImageUrl) {
      profilePreview.style.backgroundImage = `url(${user.profileImageUrl})`;
    }
  } catch (err) {
    console.error('사용자 정보 불러오기 실패', err);
  }
}

/* ------------------ 닉네임 검증 ------------------ */
async function validateNickname(input, helper, editBtn) {
  const nickname = input.value.trim();

  if (!nickname) {
    helper.textContent = '* 닉네임을 입력해주세요.';
    editBtn.disabled = true;
    return false;
  }

  if (nickname.includes(' ')) {
    helper.textContent = '* 띄어쓰기를 없애주세요.';
    editBtn.disabled = true;
    return false;
  }

  if (nickname.length > 10) {
    helper.textContent = '* 닉네임은 최대 10자까지 가능합니다.';
    editBtn.disabled = true;
    return false;
  }

  if (!/^[가-힣a-zA-Z0-9]+$/.test(nickname)) {
    helper.textContent = '* 한글/영어/숫자만 사용 가능합니다.';
    editBtn.disabled = true;
    return false;
  }

  try {
    const { isAvailable } = await checkNickname(nickname);

    if (!isAvailable && nickname !== state.user.nickname) {
      helper.textContent = '* 중복된 닉네임입니다.';
      editBtn.disabled = true;
      return false;
    }

    helper.textContent = '';
    editBtn.disabled = false;
    return true;
  } catch (err) {
    console.error(err);
    helper.textContent = '* 닉네임 확인 중 오류 발생';
    editBtn.disabled = true;
    return false;
  }
}

/* ------------------ 프로필 이미지 업로드 ------------------ */
async function handleProfileImageUpload(e, preview, helper) {
  const image = e.target.files[0];
  if (!image) return;

  const formData = new FormData();
  formData.append('image', image);

  try {
    const body = await uploadProfileImage(formData);

    preview.style.backgroundImage = `url(${body.imageUrl})`;
    helper.textContent = '';

    // 상태 업데이트
    state.user.profileImageUrl = body.imageUrl;
  } catch (err) {
    console.error(err);
    helper.textContent = '* 업로드 실패, 다시 시도해주세요.';
  }
}

/* ------------------ 수정하기 ------------------ */
async function handleSubmit(e, nicknameInput, editBtn) {
  e.preventDefault();
  if (editBtn.disabled) return;

  const nickname = nicknameInput.value.trim();
  const newImage = state.user.profileImageUrl;

  try {
    await editProfile(nickname, newImage);
    showToast('수정완료');
    
  } catch (err) {
    console.error(err);
  }
}

/* ------------------ 회원탈퇴 ------------------ */
async function handleDelete(modal) {
  try {
    await signout();
    navigate('/login');

  } catch (err) {
    console.error(err);

  } finally {
    modal.style.display = 'none';
  }
}
