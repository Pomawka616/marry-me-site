import { saveProposalAnswer, trackProposalEvent } from "./firebase.js";

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const elements = {
  loader: document.querySelector("#loader"),
  app: document.querySelector("#app"),
  floatLayer: document.querySelector("#floatLayer"),
  lineOne: document.querySelector("#lineOne"),
  lineTwo: document.querySelector("#lineTwo"),
  questionTitle: document.querySelector("#questionTitle"),
  yesButton: document.querySelector("#yesButton"),
  noButton: document.querySelector("#noButton"),
  noStatus: document.querySelector("#noStatus"),
  modal: document.querySelector("#romanticModal"),
  modalBody: document.querySelector("#modalBody"),
  celebration: document.querySelector("#celebration"),
  dateSection: document.querySelector("#dateSection"),
  dreamSection: document.querySelector("#dreamSection"),
  finalSection: document.querySelector("#finalSection"),
  weddingDate: document.querySelector("#weddingDate"),
  dreamComment: document.querySelector("#dreamComment"),
  submitAnswers: document.querySelector("#submitAnswers"),
  formStatus: document.querySelector("#formStatus"),
  loveType: document.querySelector("#loveType"),
  musicToggle: document.querySelector("#musicToggle"),
};

let noClickCount = 0;
let selectedDate = "";
let audioContext;
let musicTimer;
let isMusicPlaying = false;

const typeText = async (node, text, speed = 42) => {
  node.textContent = "";
  for (const letter of text) {
    node.textContent += letter;
    await wait(speed);
  }
};

const showApp = async () => {
  await typeText(document.querySelector("[data-loader-text]"), "Подожди секундочку... Я очень волнуюсь 🥺💕", 38);
  await wait(500);
  elements.loader.classList.add("is-hidden");
  elements.app.removeAttribute("aria-hidden");
  elements.app.classList.add("is-ready");
  await wait(450);
  await typeText(elements.lineOne, "Привет, лисёнок ❤️🦊", 46);
  await wait(260);
  await typeText(elements.lineTwo, "У меня есть один очень важный вопрос...", 36);
  elements.questionTitle.classList.add("is-visible");
  trackProposalEvent("proposal_question_shown");
};

const createFloatingStickers = () => {
  const stickers = ["❤", "✦", "🎀", "🐾", "🐱", "♡", "★", "💕", "🌸", "meow"];
  const amount = window.matchMedia("(min-width: 760px)").matches ? 34 : 22;

  for (let index = 0; index < amount; index += 1) {
    const item = document.createElement("span");
    item.className = "floating-sticker";
    item.textContent = stickers[index % stickers.length];
    item.style.left = `${Math.random() * 96}%`;
    item.style.top = `${Math.random() * 92}%`;
    item.style.setProperty("--size", `${2.2 + Math.random() * 2.4}rem`);
    item.style.setProperty("--rotate", `${-18 + Math.random() * 36}deg`);
    item.style.setProperty("--drift", `${-18 + Math.random() * 36}px`);
    item.style.setProperty("--duration", `${4.5 + Math.random() * 4}s`);
    item.style.setProperty("--delay", `${Math.random() * -5}s`);
    elements.floatLayer.append(item);
  }
};

const randomNoButtonPosition = () => {
  const button = elements.noButton;
  const maxLeft = Math.max(16, window.innerWidth - button.offsetWidth - 16);
  const maxTop = Math.max(16, window.innerHeight - button.offsetHeight - 16);
  button.classList.add("is-running");
  button.style.left = `${16 + Math.random() * (maxLeft - 16)}px`;
  button.style.top = `${16 + Math.random() * (maxTop - 16)}px`;
};

const closeModal = () => {
  if (elements.modal.open) {
    elements.modal.close();
  }
};

const openModal = (content) => {
  elements.modalBody.innerHTML = content;
  elements.modal.showModal();
};

const mathChallenge = () => {
  openModal(`
    <h3>Серьёзная проверка</h3>
    <p>Для продолжения решите: ∫(x²·sin(x))/(1+x⁴)dx</p>
    <div class="modal-inputs">
      <input id="mathAnswer" type="text" placeholder="Введите ответ" autocomplete="off" />
    </div>
    <div class="modal-actions">
      <button class="btn btn--no" id="mathSubmit" type="button">Проверить</button>
    </div>
    <p class="tiny-status" id="mathStatus"></p>
  `);
  document.querySelector("#mathSubmit").addEventListener("click", () => {
    document.querySelector("#mathStatus").textContent = "Неверно. Даже если верно, всё равно неверно 🥺";
  });
};

const passportChallenge = () => {
  openModal(`
    <h3>Регистрация отказа</h3>
    <p>Введите паспортные данные для официального протокола романтической комиссии.</p>
    <div class="modal-inputs">
      <input type="text" placeholder="Серия и номер" />
      <input type="text" placeholder="Кем выдан" />
      <input type="text" placeholder="Причина отказа" />
    </div>
    <div class="modal-actions">
      <button class="btn btn--no" id="passportSubmit" type="button">Отправить</button>
    </div>
    <p class="tiny-status" id="passportStatus"></p>
  `);
  document.querySelector("#passportSubmit").addEventListener("click", () => {
    document.querySelector("#passportStatus").textContent = "Проверка не пройдена";
  });
};

const documentChallenge = async () => {
  openModal(`
    <h3>Загрузка документов</h3>
    <p>Запрашиваем справку об отсутствии чувств и заключение комиссии романтической безопасности...</p>
    <div class="progress-bar" aria-hidden="true"><span></span></div>
    <p class="tiny-status" id="documentStatus">Пожалуйста, не закрывайте любовь.</p>
  `);
  await wait(2600);
  document.querySelector("#documentStatus").textContent = "Документ отклонён";
};

const signatureChallenge = () => {
  openModal(`
    <h3>Нужно 17 подписей котиков</h3>
    <p>Собрано: <strong id="signatureCount">0</strong>/17. Каждый котик должен подтвердить отказ лично.</p>
    <div class="signature-field" id="signatureField"></div>
  `);

  const field = document.querySelector("#signatureField");
  for (let index = 0; index < 7; index += 1) {
    const cat = document.createElement("button");
    cat.type = "button";
    cat.className = "signature-cat";
    cat.textContent = "🐱";
    cat.style.left = `${8 + Math.random() * 78}%`;
    cat.style.top = `${8 + Math.random() * 70}%`;
    cat.addEventListener("pointerenter", () => {
      cat.style.transform = `translate(${Math.random() * 110 - 55}px, ${Math.random() * 90 - 45}px) rotate(${Math.random() * 40 - 20}deg)`;
    });
    cat.addEventListener("click", () => {
      cat.style.transform = `translate(${Math.random() * 180 - 90}px, ${Math.random() * 140 - 70}px) scale(0.72)`;
    });
    field.append(cat);
  }
};

const disableNoForever = () => {
  openModal(`
    <h3>Отказ недоступен</h3>
    <p>Функция отказа временно недоступна. Попробуйте через 99 лет 11 месяцев 29 дней.</p>
    <div class="modal-actions">
      <button class="btn btn--yes" id="okLove" type="button">Понятно 💖</button>
    </div>
  `);
  document.querySelector("#okLove").addEventListener("click", closeModal);
  elements.noButton.remove();
  elements.noStatus.textContent = "Осталась самая правильная кнопка.";
};

const handleNoClick = () => {
  noClickCount += 1;
  trackProposalEvent("proposal_no_attempt", { attempt: noClickCount });

  if (noClickCount === 1) {
    randomNoButtonPosition();
    elements.noStatus.textContent = "Ой, кнопка испугалась.";
  } else if (noClickCount === 2) {
    elements.noStatus.textContent = "🐱 Ты уверена? 🥺";
  } else if (noClickCount === 3) {
    elements.noButton.classList.add("is-tiny");
    elements.noStatus.textContent = "Кнопка становится всё менее убедительной.";
  } else if (noClickCount === 4) {
    mathChallenge();
  } else if (noClickCount === 5) {
    passportChallenge();
  } else if (noClickCount === 6) {
    documentChallenge();
  } else if (noClickCount === 7) {
    signatureChallenge();
  } else {
    disableNoForever();
  }
};

const throwConfetti = () => {
  const colors = ["#ff6c9e", "#ffc75f", "#90c3cf", "#c8b3ff", "#ffffff"];
  for (let index = 0; index < 120; index += 1) {
    const piece = document.createElement("span");
    piece.className = index % 4 === 0 ? "heart-pop" : "confetti";
    piece.textContent = piece.className === "heart-pop" ? "❤" : "";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.setProperty("--fall-x", `${Math.random() * 220 - 110}px`);
    piece.style.setProperty("--fall-time", `${2.4 + Math.random() * 2.4}s`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 5200);
  }
};

const revealSection = (section) => {
  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
};

const handleYesClick = async () => {
  closeModal();
  trackProposalEvent("proposal_yes_clicked");
  throwConfetti();
  revealSection(elements.celebration);
  await wait(1850);
  revealSection(elements.dateSection);
};

const collectClientMeta = () => ({
  browser: navigator.userAgent,
  platform: navigator.platform,
  screenWidth: window.screen.width,
  screenHeight: window.screen.height,
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});

const handleSubmit = async () => {
  const comment = elements.dreamComment.value.trim();

  if (!selectedDate) {
    elements.formStatus.textContent = "Сначала выбери дату, пожалуйста.";
    elements.dateSection.scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (!comment) {
    elements.formStatus.textContent = "Напиши хотя бы пару слов о мечте.";
    elements.dreamComment.focus();
    return;
  }

  elements.submitAnswers.disabled = true;
  elements.formStatus.textContent = "Сохраняю всё очень бережно...";

  try {
    await saveProposalAnswer({
      selectedDate,
      comment,
      timestamp: new Date().toISOString(),
      ...collectClientMeta(),
    });
    trackProposalEvent("proposal_answer_saved");
    elements.formStatus.textContent = "";
    revealSection(elements.finalSection);
    await typeText(elements.loveType, "Я люблю тебя ❤️", 55);
  } catch (error) {
    console.error(error);
    elements.formStatus.textContent = "Не получилось сохранить. Проверь Firebase Config и правила Firestore.";
    elements.submitAnswers.disabled = false;
  }
};

const playSoftNote = (frequency, startTime, duration) => {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.045, startTime + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
};

const toggleMusic = async () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  isMusicPlaying = !isMusicPlaying;
  elements.musicToggle.classList.toggle("is-playing", isMusicPlaying);
  elements.musicToggle.setAttribute("aria-pressed", String(isMusicPlaying));
  elements.musicToggle.querySelector(".music-toggle__text").textContent = isMusicPlaying ? "Играет" : "Музыка";

  if (!isMusicPlaying) {
    window.clearInterval(musicTimer);
    return;
  }

  const melody = [392, 440, 523.25, 493.88, 440, 392, 349.23, 392];
  let step = 0;
  const playLoop = () => {
    const now = audioContext.currentTime;
    playSoftNote(melody[step % melody.length], now, 0.8);
    playSoftNote(melody[(step + 2) % melody.length] / 2, now + 0.04, 1.05);
    step += 1;
  };

  playLoop();
  musicTimer = window.setInterval(playLoop, 940);
};

elements.noButton.addEventListener("click", handleNoClick);
elements.yesButton.addEventListener("click", handleYesClick);
elements.weddingDate.addEventListener("change", () => {
  selectedDate = elements.weddingDate.value;
  if (selectedDate) {
    elements.dreamSection.hidden = false;
    elements.dreamSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});
elements.submitAnswers.addEventListener("click", handleSubmit);
elements.musicToggle.addEventListener("click", toggleMusic);
elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) closeModal();
});

createFloatingStickers();
showApp();
