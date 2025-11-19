import { getPosts } from "../apis/post.js";
import { navigate } from "../app/router.js";

let postList;
let cursor = null;
let isLoading = false;
let hasNext = true;

export function MainBoardView() {
  return `
    <main class="page-board">

      <section class="board-header">
        <div class="board-greeting-box">
          <p class="board-greeting">
            나만의 작은 도서관, <strong>마이위키</strong>
          </p>
        </div>

        <div class="board-btn-box">
          <button class="btn btn-primary write-btn">새 문서 작성</button>
        </div>
      </section>

      <section class="post-list"></section>

    </main>
  `;
}

MainBoardView.setup = function () {
  // DOM 요소 연결 (렌더 이후!)
  postList = document.querySelector(".post-list");
  const writeBtn = document.querySelector(".write-btn");

  // 상태 초기화 (SPA에서 뒤로가기/앞으로가기로 다시 들어올 수도 있음)
  cursor = null;
  isLoading = false;
  hasNext = true;
  postList.innerHTML = ""; // 기존 게시글 제거

  // 게시글 작성 페이지로 이동
  writeBtn.addEventListener("click", () => navigate("/create-post"));

  // 최초 로드
  loadPosts();

  // 무한 스크롤 등록
  window.addEventListener("scroll", handleScroll);
};

function handleScroll() {
  const scrollTop = document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;

  if (scrollTop + viewportHeight >= fullHeight - 200) {
    loadPosts();
  }
}

async function loadPosts() {
  if (isLoading || !hasNext) return;

  isLoading = true;

  try {
    const res = await getPosts(cursor);

    const posts = res.items;
    cursor = res.nextCursor;
    hasNext = res.hasNext;

    posts.forEach(renderPostCard);
  } catch (err) {
    console.error("게시글 불러오기 실패", err);
  } finally {
    isLoading = false;
  }
}

function renderPostCard(post) {
  const card = document.createElement("article");
  card.classList.add("post-card");
  card.dataset.postId = post.id;

  const title =
    post.title && post.title.length > 26
      ? post.title.substring(0, 26) + "..."
      : post.title;

  const date = post.createdAt
    ? post.createdAt.replace("T", " ").split(".")[0]
    : "";

  const like = formatCount(post.likeCount);
  const comment = formatCount(post.commentCount);
  const view = formatCount(post.viewCount);

  card.innerHTML = `
      <div class="post-header">
        <div>
          <h3 class="post-title">${title}</h3>
          <div class="post-meta">
            <span>좋아요 ${like}</span>
            <span>댓글 ${comment}</span>
            <span>조회수 ${view}</span>
          </div>
        </div>
        <span class="post-date">${date}</span>
      </div>

      <hr class="post-divider" />

      <div class="post-writer">
        <div class="profile-circle"></div>
        <span class="writer-name">${post.writerNickname}</span>
      </div>
  `;

  const profileCircle = card.querySelector(".profile-circle");

  if (post.writerProfileImageUrl) {
    profileCircle.style.backgroundImage = `url('${post.writerProfileImageUrl}')`;
  }

  // 상세 페이지 이동
  card.addEventListener("click", () => {
    navigate('/posts', { id: post.id });
  });

  postList.appendChild(card);
}

function formatCount(num) {
  if (num >= 1000) {
    return Math.floor(num / 1000) + "k";
  }
  return num;
}
