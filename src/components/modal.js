let modal, title, message, cancelBtn, confirmBtn;
let confirmCallback = null;

export function setupModalEvents() {
  modal = document.getElementById("global-modal");
  title = modal.querySelector(".modal-title");
  message = modal.querySelector(".modal-message");

  cancelBtn = modal.querySelector(".modal-cancel-btn");
  confirmBtn = modal.querySelector(".modal-confirm-btn");

  // 이벤트 등록
  cancelBtn.addEventListener("click", closeModal);

  confirmBtn.addEventListener("click", () => {
    if (confirmCallback) confirmCallback();
    closeModal();
  });
}

export function openModal({ titleText, messageText, onConfirm }) {
  title.textContent = titleText || "";
  message.textContent = messageText || "";

  confirmCallback = onConfirm || null;

  modal.classList.add("show");
}

export function closeModal() {
  modal.classList.remove("show");
}
