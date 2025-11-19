import { updatePassword } from "../apis/user.js";
import { showToast } from "../util/toast.js";

// DOM 선택
let form;
let oldPw;
let newPw;
let confirmPw;

let oldHelper;
let newHelper;
let confirmHelper;
let submitBtn;

let isValidNew = false;
let isValidConfirm = false;

export function EditPasswordView() {
  return `
    <main class="page-password">
      <section class="password-card">

        <h2 class="password-title">비밀번호 수정</h2>

        <form class="password-form">

          <div class="form-group">
            <label for="old-password">비밀번호</label>
            <input id="old-password" type="password" class="input-field" placeholder="기존 비밀번호를 입력하세요" />
            <p class="helper-text old-password-helper"></p>
          </div>

          <div class="form-group">
            <label for="new-password">새 비밀번호</label>
            <input id="new-password" type="password" class="input-field" placeholder="새 비밀번호를 입력하세요" />
            <p class="helper-text new-password-helper"></p>
          </div>

          <div class="form-group">
            <label for="confirm-new-password">새 비밀번호 확인</label>
            <input id="confirm-new-password" type="password" class="input-field" placeholder="새 비밀번호를 한 번 더 입력하세요" />
            <p class="helper-text confirm-password-helper"></p>
          </div>

          <button type="submit" class="btn btn-primary password-submit-btn" disabled>
            수정하기
          </button>

        </form>
      </section>
    </main>
  `;
}

EditPasswordView.setup = function() {
    form = document.querySelector(".password-form");
    oldPw = document.querySelector("#old-password");
    newPw = document.querySelector("#new-password");
    confirmPw = document.querySelector("#confirm-new-password");

    oldHelper = document.querySelector(".old-password-helper");
    newHelper = document.querySelector(".new-password-helper");
    confirmHelper = document.querySelector(".confirm-password-helper");
    submitBtn = document.querySelector(".password-submit-btn");

    newPw.addEventListener("blur", validateNewPw);
    confirmPw.addEventListener("blur", validateConfirmPw);
    oldPw.addEventListener("blur", () => {
        if (!oldPw.value.trim()) oldHelper.textContent = "* 비밀번호를 입력해주세요.";
        else oldHelper.textContent = "";
    });

    form.addEventListener("submit", async (e) => submitButton(e));
}

function validateNewPw() {
    const pw = newPw.value.trim();
    const confirm = confirmPw.value.trim();

    if (!pw) {
      newHelper.textContent = "* 비밀번호를 입력해주세요.";
      isValidNew = false;

    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{8,20}$/.test(pw)) {
      newHelper.textContent =
        "* 비밀번호는 8~20자이며, 영문 + 숫자를 포함해야 합니다.";
      isValidNew = false;

    } else if (confirm && pw !== confirm) {
      newHelper.textContent = "* 비밀번호 확인과 다릅니다.";
      isValidNew = false;

    } else {
      newHelper.textContent = "";
      confirmHelper.textContent = "";
      isValidNew = true;
    }
    updateButton();
  }

function validateConfirmPw() {
    const pw = newPw.value.trim();
    const confirm = confirmPw.value.trim();

    if (!confirm) {
        confirmHelper.textContent = "* 비밀번호를 한번 더 입력해주세요.";
        isValidConfirm = false;

    } else if (pw !== confirm) {
        confirmHelper.textContent = "* 비밀번호와 다릅니다.";
        isValidConfirm = false;

    } else {
        confirmHelper.textContent = "";
        newHelper.textContent = "";
        isValidConfirm = true;
    }
    updateButton();
}

function updateButton() {
    if (isValidNew && isValidConfirm) {
        submitBtn.disabled = false;
        submitBtn.classList.add("active");

    } else {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
    }
}

async function submitButton(e) {
    e.preventDefault();

    const oldPassword = oldPw.value.trim();
    const newPassword = newPw.value.trim();

    try {
        await updatePassword(oldPassword, newPassword);
        showToast("수정완료");
        console.log("비밀번호 수정 완료");

    } catch (err) {
        oldHelper.textContent = "* 비밀번호를 다시 입력해주세요.";
        console.error(err);
    }
}