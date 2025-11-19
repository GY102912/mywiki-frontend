import { navigate } from '../app/router.js';
import { createPost } from "../apis/post.js";
import { uploadProfileImage } from "../apis/user.js";

const dom = {};
let imageUrls = [];

let isTitleValid = false;
let isContentValid = false;

export function CreatePostView() {
  return `
    <main class="post-create-container">

      <section class="post-header">
        <h2 class="post-title">게시글 작성</h2>
      </section>

      <section class="edit-form">

        <!-- 제목 -->
        <div class="form-group">
          <label class="title-label">제목*</label>
          <hr class="divider" />
          <input type="text" class="title-input" placeholder="제목을 입력해주세요. (최대 26글자)" />
          <hr class="divider" />
          <p class="title-helper helper-text"></p>
        </div>

        <!-- 내용 -->
        <div class="form-group">
          <label class="content-label">내용*</label>
          <hr class="divider" />
          <textarea class="content-input" rows="8" placeholder="내용을 입력해주세요."></textarea>
          <hr class="divider" />
          <p class="content-helper helper-text"></p>
        </div>

        <!-- 이미지 -->
        <div class="form-group">
          <label class="image-label">이미지</label>
          <div class="file-box">
            <input type="file" class="image-input" accept="image/*" />
          </div>
        </div>

        <button class="submit-btn" disabled>완료</button>

      </section>
    </main>
  `;
}

/* ==========================================================
   setup()
========================================================== */
CreatePostView.setup = function () {
  dom.titleInput = document.querySelector(".title-input");
  dom.contentInput = document.querySelector(".content-input");
  dom.imageInput = document.querySelector(".image-input");
  dom.submitBtn = document.querySelector(".submit-btn");
  dom.titleHelper = document.querySelector(".title-helper");
  dom.contentHelper = document.querySelector(".content-helper");

  // 이벤트 등록
  dom.titleInput.addEventListener("blur", validateTitle);
  dom.contentInput.addEventListener("blur", validateContent);
  dom.imageInput.addEventListener("change", handleImageUpload);
  dom.submitBtn.addEventListener("click", handleSubmit);
};

/* ==========================================================
   Validation
========================================================== */
function validateTitle() {
  const title = dom.titleInput.value.trim();

  if (title.length === 0) {
    dom.titleHelper.textContent = "제목은 필수 입력입니다.";
    isTitleValid = false;
  } else if (title.length > 26) {
    dom.titleHelper.textContent = "제목은 최대 26글자까지 입력 가능합니다.";
    isTitleValid = false;
  } else {
    dom.titleHelper.textContent = "";
    isTitleValid = true;
  }

  updateSubmitButton();
}

function validateContent() {
  const content = dom.contentInput.value.trim();

  if (content.length === 0) {
    dom.contentHelper.textContent = "내용은 필수 입력입니다.";
    isContentValid = false;
  } else {
    dom.contentHelper.textContent = "";
    isContentValid = true;
  }

  updateSubmitButton();
}

function updateSubmitButton() {
  if (isTitleValid && isContentValid) {
    dom.submitBtn.disabled = false;
    dom.submitBtn.classList.add("active");
  } else {
    dom.submitBtn.disabled = true;
    dom.submitBtn.classList.remove("active");
  }
}

/* ==========================================================
   이미지 업로드
========================================================== */
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("image", file);

  try {
    const res = await uploadProfileImage(fd);
    imageUrls.push(res.imageUrl);
    console.log("이미지 업로드 성공:", res.imageUrl);
  } catch (err) {
    console.error("이미지 업로드 실패", err);
  }
}

/* ==========================================================
   게시글 등록
========================================================== */
async function handleSubmit() {
  if (!isTitleValid || !isContentValid) return;

  const title = dom.titleInput.value.trim();
  const content = dom.contentInput.value.trim();

  try {
    const res = await createPost(title, content, imageUrls);

    // 등록 후 상세 페이지로 이동
    navigate('/posts', { id: res.id });

  } catch (err) {
    console.error(err);
  }
}
