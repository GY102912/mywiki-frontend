// EditPostView.js

import { getPostDetail, updatePost } from "../apis/post.js";
import { uploadProfileImage } from "../apis/user.js";
import { navigate } from '../app/router.js';

const dom = {};

let POST_ID;
let imageUrls = [];
let isTitleValid = false;
let isContentValid = false;

export function EditPostView() {
  return `
    <main class="post-edit-container">

      <section class="post-header">
        <h2 class="post-title">게시글 수정</h2>
      </section>

      <section class="edit-form">

        <!-- 제목 -->
        <div class="form-group">
          <label>제목*</label>
          <hr class="divider" />
          <input type="text" class="title-input" placeholder="제목을 입력해주세요. (최대 26글자)" />
          <hr class="divider" />
          <p class="title-helper helper-text"></p>
        </div>

        <!-- 내용 -->
        <div class="form-group">
          <label>내용*</label>
          <hr class="divider" />
          <textarea class="content-input" rows="8" placeholder="내용을 입력해주세요."></textarea>
          <hr class="divider" />
          <p class="content-helper helper-text"></p>
        </div>

        <!-- 이미지 업로드 -->
        <div class="form-group">
          <label>이미지</label>
          <div class="file-box">
            <input type="file" class="image-input" accept="image/*" />
          </div>
        </div>

        <!-- 수정 버튼 -->
        <button class="submit-btn" disabled>수정하기</button>

      </section>
    </main>
  `;
}

/* ==========================================================
   setup({ id })
========================================================== */
EditPostView.setup = function ({ id }) {
  POST_ID = id;

  // ====== DOM SELECT ======
  dom.title = document.querySelector(".title-input");
  dom.titleHelper = document.querySelector(".title-helper");

  dom.content = document.querySelector(".content-input");
  dom.contentHelper = document.querySelector(".content-helper");

  dom.imageInput = document.querySelector(".image-input");
  dom.submitBtn = document.querySelector(".submit-btn");

  // ===== 이벤트 등록 =====
  dom.title.addEventListener("input", () => {
    validateTitle();
    updateSubmitButton();
  });

  dom.content.addEventListener("input", () => {
    validateContent();
    updateSubmitButton();
  });

  dom.imageInput.addEventListener("change", handleImageUpload);
  dom.submitBtn.addEventListener("click", submitEdit);

  // 데이터 로딩
  loadPostDetail();
};

/* ==========================================================
   📌 게시글 데이터 로드
========================================================== */
async function loadPostDetail() {
  try {
    const post = await getPostDetail(POST_ID);

    dom.title.value = post.title ?? "";
    dom.content.value = post.content ?? "";

    if (Array.isArray(post.postImageUrls)) {
      imageUrls = [...post.postImageUrls];
    }

    // 초기값 검증
    validateTitle();
    validateContent();
    updateSubmitButton();

  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   📌 검증
========================================================== */
function validateTitle() {
  const value = dom.title.value.trim();
  if (!value) {
    dom.titleHelper.textContent = "제목은 필수 입력입니다.";
    isTitleValid = false;
  } else if (value.length > 26) {
    dom.titleHelper.textContent = "제목은 26자 이내여야 합니다.";
    isTitleValid = false;
  } else {
    dom.titleHelper.textContent = "";
    isTitleValid = true;
  }
}

function validateContent() {
  const value = dom.content.value.trim();
  if (!value) {
    dom.contentHelper.textContent = "내용은 필수 입력입니다.";
    isContentValid = false;
  } else {
    dom.contentHelper.textContent = "";
    isContentValid = true;
  }
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
   📌 이미지 업로드
========================================================== */
async function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append("image", file);

  try {
    const res = await uploadProfileImage(fd);   // 서버 응답: { imageUrl: "..." } 라고 가정
    const { imageUrl } = res;

    if (!imageUrl) {
      console.error("imageUrl이 응답에 없습니다:", res);
      alert("이미지 업로드 응답이 올바르지 않습니다.");
      return;
    }

    // 🔥 기존 이미지들 버리고 새 이미지 1개로 교체
    imageUrls = [imageUrl];

  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   📌 수정 요청
========================================================== */
async function submitEdit() {
  if (!isTitleValid || !isContentValid) return;

  const title = dom.title.value.trim();
  const content = dom.content.value.trim();
  const postImageUrls = [...imageUrls];

  try {
    await updatePost(POST_ID, title, content, postImageUrls);

    // 수정 후 상세 페이지로 이동
    navigate('/posts', { id: POST_ID });

  } catch (err) {
    console.error(err);
  }
}
