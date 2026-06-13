import { deleteProposalAnswer, loadProposalAnswers, trackProposalEvent } from "./firebase.js";

// Пароль хранится в JS по требованию. Для публичного GitHub Pages это удобная,
// но не криптографическая защита: настоящие ограничения задаются правилами Firestore.
const ADMIN_PASSWORD = "love-2026";

const nodes = {
  loginPanel: document.querySelector("#loginPanel"),
  dashboard: document.querySelector("#dashboard"),
  loginForm: document.querySelector("#loginForm"),
  passwordInput: document.querySelector("#passwordInput"),
  loginStatus: document.querySelector("#loginStatus"),
  dashboardStatus: document.querySelector("#dashboardStatus"),
  answersBody: document.querySelector("#answersBody"),
  totalCount: document.querySelector("#totalCount"),
  lastDate: document.querySelector("#lastDate"),
  refreshButton: document.querySelector("#refreshButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  answerDialog: document.querySelector("#answerDialog"),
  answerDetails: document.querySelector("#answerDetails"),
  dialogClose: document.querySelector("#dialogClose"),
};

let answers = [];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ru-RU");
};

const trimText = (text, length = 150) => {
  if (!text) return "—";
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

const downloadFile = (filename, content, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => {
  const normalized = value === undefined || value === null ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
};

const renderAnswers = () => {
  nodes.answersBody.innerHTML = "";
  nodes.totalCount.textContent = answers.length;
  nodes.lastDate.textContent = answers[0]?.selectedDate || "—";

  if (!answers.length) {
    nodes.answersBody.innerHTML = `
      <tr>
        <td colspan="5">Ответов пока нет.</td>
      </tr>
    `;
    return;
  }

  for (const answer of answers) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${answer.selectedDate || "—"}</td>
      <td class="comment">${trimText(answer.comment)}</td>
      <td>${answer.platform || "—"}<br />${answer.language || "—"}<br />${answer.screenWidth || "?"}×${answer.screenHeight || "?"}</td>
      <td>${formatDate(answer.timestamp)}<br />${answer.timezone || "—"}</td>
      <td>
        <div class="row-actions">
          <button class="ghost" data-action="view" data-id="${answer.id}" type="button">Смотреть</button>
          <button class="danger" data-action="delete" data-id="${answer.id}" type="button">Удалить</button>
        </div>
      </td>
    `;
    nodes.answersBody.append(row);
  }
};

const loadAnswers = async () => {
  nodes.dashboardStatus.textContent = "Загружаю ответы...";
  try {
    answers = await loadProposalAnswers();
    renderAnswers();
    nodes.dashboardStatus.textContent = "Готово.";
    trackProposalEvent("admin_answers_loaded", { count: answers.length });
  } catch (error) {
    console.error(error);
    nodes.dashboardStatus.textContent = "Не удалось загрузить ответы. Проверь Firebase Config и правила Firestore.";
  }
};

const showDashboard = () => {
  nodes.loginPanel.hidden = true;
  nodes.dashboard.hidden = false;
  sessionStorage.setItem("proposalAdmin", "true");
  loadAnswers();
};

const handleLogin = (event) => {
  event.preventDefault();
  if (nodes.passwordInput.value === ADMIN_PASSWORD) {
    nodes.loginStatus.textContent = "";
    showDashboard();
  } else {
    nodes.loginStatus.textContent = "Неверный пароль.";
  }
};

const exportJson = () => {
  downloadFile("proposal-answers.json", JSON.stringify(answers, null, 2), "application/json;charset=utf-8");
};

const exportCsv = () => {
  const headers = [
    "id",
    "selectedDate",
    "comment",
    "timestamp",
    "browser",
    "platform",
    "screenWidth",
    "screenHeight",
    "language",
    "timezone",
  ];
  const rows = answers.map((answer) => headers.map((header) => csvEscape(answer[header])).join(","));
  downloadFile("proposal-answers.csv", [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
};

const handleTableClick = async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const answer = answers.find((item) => item.id === button.dataset.id);
  if (!answer) return;

  if (button.dataset.action === "view") {
    nodes.answerDetails.textContent = JSON.stringify(answer, null, 2);
    nodes.answerDialog.showModal();
    return;
  }

  if (button.dataset.action === "delete") {
    const confirmed = window.confirm("Удалить эту запись из Firestore?");
    if (!confirmed) return;

    nodes.dashboardStatus.textContent = "Удаляю запись...";
    try {
      await deleteProposalAnswer(answer.id);
      answers = answers.filter((item) => item.id !== answer.id);
      renderAnswers();
      nodes.dashboardStatus.textContent = "Запись удалена.";
    } catch (error) {
      console.error(error);
      nodes.dashboardStatus.textContent = "Не удалось удалить запись. Проверь правила Firestore.";
    }
  }
};

nodes.loginForm.addEventListener("submit", handleLogin);
nodes.refreshButton.addEventListener("click", loadAnswers);
nodes.exportJsonButton.addEventListener("click", exportJson);
nodes.exportCsvButton.addEventListener("click", exportCsv);
nodes.answersBody.addEventListener("click", handleTableClick);
nodes.dialogClose.addEventListener("click", () => nodes.answerDialog.close());
nodes.answerDialog.addEventListener("click", (event) => {
  if (event.target === nodes.answerDialog) nodes.answerDialog.close();
});

if (sessionStorage.getItem("proposalAdmin") === "true") {
  showDashboard();
}
