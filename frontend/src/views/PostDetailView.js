import { navigate } from '../app/router.js';

import { 
  getPostDetail, deletePost, likePost, unlikePost 
} from "../apis/post.js";

import { 
  getComments, createComment, updateComment, deleteComment 
} from "../apis/comment.js";

import { openModal, closeModal } from "../components/modal.js";

let POST_ID;

/* ==========================================================
   🧱 View: HTML 반환
========================================================== */
export function PostDetailView() {
  return `
    <main class="post-container">

      <!-- 게시글 헤더 -->
      <section class="post-header">
        <div class="post-header-left">
          <h2 class="post-title"></h2>
          <div class="post-writer">
            <div class="profile-circle"></div>
            <span class="writer-name"></span>
            <span class="post-date"></span>
          </div>
        </div>

        <div class="post-header-right">
          <button class="edit-btn">수정</button>
          <button class="delete-btn">삭제</button>
        </div>
      </section>

      <hr class="divider" />

      <!-- 본문 -->
      <section class="post-body">
        <img class="post-image" alt="게시글 이미지" />
        <p class="post-content"></p>
      </section>

      <!-- 통계 -->
      <section class="post-stats">
        <div class="stat-box like-count-box">
          <span class="like-count">0</span>
          <span class="label">좋아요수</span>
        </div>
        <div class="stat-box view-count-box">
          <span class="view-count">0</span>
          <span class="label">조회수</span>
        </div>
        <div class="stat-box comment-count-box">
          <span class="comment-count">0</span>
          <span class="label">댓글수</span>
        </div>
      </section>

      <hr class="divider" />

      <!-- 댓글 입력 -->
      <section class="comment-write">
        <textarea placeholder="댓글을 남겨주세요!"></textarea>
        <hr class="comment-divider" />
        <button class="comment-submit">댓글 등록</button>
      </section>

      <!-- 댓글 목록 -->
      <section class="comment-list"></section>

      <!-- 게시글 삭제 모달 -->
      <div id="post-modal" class="modal">
        <div class="modal-content">
          <h3>게시글을 삭제하시겠습니까?</h3>
          <p>삭제한 내용은 복구할 수 없습니다.</p>
          <div class="modal-actions">
            <button class="btn cancel post-cancel-btn">취소</button>
            <button class="btn confirm post-confirm-btn">확인</button>
          </div>
        </div>
      </div>

      <!-- 댓글 삭제 모달 -->
      <div id="comment-modal" class="modal">
        <div class="modal-content">
          <p>댓글을 삭제하시겠습니까?</p>
          <div class="modal-actions">
            <button class="btn cancel comment-cancel-btn">취소</button>
            <button class="btn confirm comment-confirm-btn">삭제</button>
          </div>
        </div>
      </div>

    </main>
  `;
}

/* ==========================================================
   ⚙️ View.setup: DOM 선택 + 이벤트 등록만
========================================================== */
PostDetailView.setup = function({ id }) {
    POST_ID = id;
        
    // ===== DOM 선택 =====
    dom.title = document.querySelector(".post-title");
    dom.writerName = document.querySelector(".writer-name");
    dom.writerProfile = document.querySelector(".profile-circle");
    dom.date = document.querySelector(".post-date");
    dom.content = document.querySelector(".post-content");
    dom.image = document.querySelector(".post-image");

    dom.likeBox = document.querySelector(".like-count-box");
    dom.likeCount = document.querySelector(".like-count");
    dom.viewBox = document.querySelector(".view-count-box");
    dom.viewCount = document.querySelector(".view-count");
    dom.commentCountBox = document.querySelector(".comment-count-box");
    dom.commentCount = document.querySelector(".comment-count");

    dom.commentTextarea = document.querySelector(".comment-write textarea");
    dom.commentSubmit = document.querySelector(".comment-submit");
    dom.commentList = document.querySelector(".comment-list");

    dom.editBtn = document.querySelector(".edit-btn");
    dom.deleteBtn = document.querySelector(".delete-btn");

    dom.postModal = document.getElementById("post-modal");
    dom.postCancel = document.querySelector(".post-cancel-btn");
    dom.postConfirm = document.querySelector(".post-confirm-btn");

    dom.commentModal = document.getElementById("comment-modal");
    dom.commentCancel = document.querySelector(".comment-cancel-btn");
    dom.commentConfirm = document.querySelector(".comment-confirm-btn");

    // ===== 이벤트 등록 =====
    dom.commentList.addEventListener("click", (e) => handleCommentListClick(e));
    
    // 게시글 삭제 버튼 → 모달 열기
    dom.deleteBtn.addEventListener("click", () => openPostDeleteModal());

    // 게시글 삭제 모달 취소 버튼
    dom.postCancel.addEventListener("click", () => closeModal());

    // 좋아요
    dom.likeBox.addEventListener("click", () => toggleLike());

    // 댓글 등록
    dom.commentSubmit.addEventListener("click", () => submitComment());

    // 무한 스크롤
    window.addEventListener("scroll", () => handleScroll());

    // 게시글 수정 이동
    dom.editBtn.addEventListener("click", () => navigate('/edit-post', { id: POST_ID }));

    // 초기 데이터 로드
    loadPostDetail();
};

/* ==========================================================
   📌 내부 상태
========================================================== */
const dom = {};

let likeCount = 0;
let isLiked = false;
let deletingCommentId = null;

let cursor = null;
let hasNext = true;
let isLoading = false;

/* ==========================================================
   📌 게시글 로드
========================================================== */
async function loadPostDetail() {
  try {
    const post = await getPostDetail(POST_ID);

    dom.writerName.textContent = post.writerNickname;
    if (post.writerProfileImageUrl) {
      dom.writerProfile.style.backgroundImage = `url('${post.writerProfileImageUrl}')`;
      dom.writerProfile.style.backgroundSize = "cover";
      dom.writerProfile.style.backgroundPosition = "center";
    }

    dom.date.textContent = formatDate(post.createdAt);
    dom.title.textContent = post.title;
    dom.content.textContent = post.content;

    if (post.postImageUrls?.length > 0) {
      dom.image.src = post.postImageUrls[0];
      dom.image.style.display = "block";
    } else {
      dom.image.style.display = "none";
    }

    // 통계
    likeCount = post.likeCount;
    isLiked = post.isLiked;
    updateLikeUI();

    dom.viewCount.textContent = post.viewCount;
    dom.commentCount.textContent = post.commentCount;

    // 댓글 초기 렌더링
    dom.commentList.innerHTML = "";
    cursor = post.commentsPreview.nextCursor;
    hasNext = post.commentsPreview.hasNext;

    renderComments(post.commentsPreview.items);

  } catch (err) {
    console.error(err);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

/* ==========================================================
   📌 좋아요 UI 업데이트
========================================================== */
function updateLikeUI() {
  dom.likeCount.textContent = likeCount;

  if (isLiked) {
    dom.likeBox.classList.remove("enabled");
    dom.likeBox.classList.add("disabled");

  } else {
    dom.likeBox.classList.remove("disabled");
    dom.likeBox.classList.add("enabled");
  }
}

/* ==========================================================
   📌 좋아요 / 취소
========================================================== */
async function toggleLike() {
  try {
    if (isLiked) {
      await unlikePost(POST_ID);
      isLiked = false;
      likeCount--;

    } else {
      await likePost(POST_ID);
      isLiked = true;
      likeCount++;
    }
    updateLikeUI();

  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   📌 댓글 렌더링
========================================================== */
function renderComments(items) {
  items.forEach((c) => {
    const el = document.createElement("article");
    el.classList.add("comment-item");

    el.innerHTML = `
      <div class="comment-header">
        <div class="comment-info">
          <div class="profile-circle"
               style="background-image:url('${c.writerProfileImageUrl || ""}'); background-size:cover;"></div>
          <span class="comment-writer">${c.writerNickname}</span>
          <span class="comment-date">${formatDate(c.createdAt)}</span>
        </div>

        <div class="comment-actions">
          ${c.isWriter ? `
            <button class="comment-edit-btn" data-id="${c.id}">수정</button>
            <button class="comment-delete-btn" data-id="${c.id}">삭제</button>
          ` : ""}
        </div>
      </div>
      <p class="comment-content">${c.content}</p>
    `;

    dom.commentList.appendChild(el);
  });
}

/* ==========================================================
   📌 댓글 이벤트 등록
========================================================== */
function handleCommentListClick(e) {
    const target = e.target;

    // 수정 버튼 클릭
    if (target.classList.contains("comment-edit-btn")) {
        const id = target.dataset.id;
        enterCommentEdit(id);
        return;
    }

    // 삭제 버튼 클릭
    if (target.classList.contains("comment-delete-btn")) {
        const id = target.dataset.id;
        openCommentDeleteModal(id);
        return;
    }

    // 수정 완료 버튼
    if (target.classList.contains("comment-edit-save")) {
        const id = target.dataset.id;
        saveCommentEdit(id);
        return;
    }

    // 수정 취소 버튼
    if (target.classList.contains("comment-edit-cancel")) {
        const id = target.dataset.id;
        const item = target.closest(".comment-item");
        const original = item.dataset.originalContent; // 필요하면 따로 저장
        cancelCommentEdit(id, original);
        return;
    }
}

/* ==========================================================
   📌 댓글 등록
========================================================== */
async function submitComment() {
    const content = dom.commentTextarea.value.trim();
    if (!content) return alert("내용을 입력하세요.");

    try {
        await createComment(POST_ID, content);
        dom.commentTextarea.value = "";
        loadPostDetail(POST_ID);

    } catch (err) {
        console.error(err);
    }
}

/* ==========================================================
   📌 댓글 수정 모드
========================================================== */
function enterCommentEdit(commentId) {
    const item = document.querySelector(`button[data-id="${commentId}"]`).closest(".comment-item");
    const text = item.querySelector(".comment-content").textContent;

    item.querySelector(".comment-content").outerHTML = `
        <textarea class="comment-edit-area">${text}</textarea>
    `;

    item.querySelector(".comment-actions").innerHTML = `
        <button class="comment-edit-save" data-id="${commentId}">저장</button>
        <button class="comment-edit-cancel" data-id="${commentId}">취소</button>
    `;

    item.querySelector(".comment-edit-save").addEventListener("click", () => saveCommentEdit(commentId));
    item.querySelector(".comment-edit-cancel").addEventListener("click", () => cancelCommentEdit(commentId, text));
}

function cancelCommentEdit(commentId, original) {
    const item = document.querySelector(`button[data-id="${commentId}"]`).closest(".comment-item");

    item.querySelector(".comment-edit-area").outerHTML =
        `<p class="comment-content">${original}</p>`;
    item.querySelector(".comment-actions").innerHTML = `
        <button class="comment-edit-btn" data-id="${commentId}">수정</button>
        <button class="comment-delete-btn" data-id="${commentId}">삭제</button>
    `;
}

async function saveCommentEdit(commentId) {
  const item = document.querySelector(`button[data-id="${commentId}"]`).closest(".comment-item");
  const value = item.querySelector(".comment-edit-area").value.trim();

  if (!value) return alert("내용을 입력하세요.");

  try {
    await updateComment(POST_ID, commentId, value);
    loadPostDetail(POST_ID);

  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================
   📌 댓글 삭제 모달
========================================================== */
function openCommentDeleteModal(id) {
    deletingCommentId = id;

    openModal({
        titleText: "댓글 삭제",
        messageText: "댓글을 삭제하시겠습니까?",
        onConfirm: async () => {
            await deleteComment(POST_ID, id);
            loadPostDetail(POST_ID);
        }
    });
}

/* ==========================================================
   📌 게시글 삭제 모달
========================================================== */
function openPostDeleteModal() {
    openModal({
            titleText: "게시글 삭제",
            messageText: "게시글을 삭제하시겠습니까?",
            onConfirm: async () => {
                await deletePost(POST_ID);
                navigate('/boards/main');
            }
        });
}

/* ==========================================================
   📌 무한 스크롤
========================================================== */
async function handleScroll() {
  if (isLoading || !hasNext) return;

  const top = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight;
  const vh = window.innerHeight;

  if (top + vh >= height - 200) {
    loadMoreComments();
  }
}

async function loadMoreComments() {
  if (isLoading || !hasNext) return;
  isLoading = true;

  try {
    const res = await getComments(POST_ID, cursor);
    renderComments(res.items);
    cursor = res.nextCursor;
    hasNext = res.hasNext;

  } catch (err) {
    console.error(err);
  }

  isLoading = false;
}

/* ==========================================================
   📌 유틸
========================================================== */
function formatDate(str) {
  if (!str) return "";
  return str.replace("T", " ").split(".")[0];
}
