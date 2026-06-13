# Романтический сайт-предложение

Готовый статический проект для GitHub Pages: HTML5, CSS3, Vanilla JavaScript, Firebase Firestore и Firebase Analytics.

## Файлы

- `index.html` — основной романтический сценарий с загрузкой, предложением, выбором даты и финальным экраном.
- `styles.css` — premium pastel/kawaii визуал, адаптив, анимации, стекломорфизм.
- `script.js` — интерактив, сопротивляющаяся кнопка «Нет», музыка, отправка формы.
- `firebase.js` — единая настройка Firebase, Firestore и Analytics.
- `admin.html` — отдельная страница просмотра ответов.
- `admin.css` — стили админ-панели.
- `admin.js` — авторизация по паролю, загрузка, просмотр, удаление, экспорт JSON/CSV.

## Настройка Firebase

1. Создайте проект в Firebase Console.
2. Добавьте Web App и скопируйте Firebase Config.
3. Откройте `firebase.js` и замените все значения `PASTE_...` на реальные.
4. Включите Firestore Database.
5. Включите Analytics, если хотите собирать события.

Коллекция Firestore создаётся автоматически при первой отправке:

```text
proposalAnswers
```

Каждая запись содержит:

```text
selectedDate, comment, timestamp, browser, platform, screenWidth, screenHeight, language, timezone
```

## Правила Firestore

Для быстрого личного запуска можно временно использовать открытые правила:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /proposalAnswers/{document} {
      allow read, write: if true;
    }
  }
}
```

Для публичного сайта лучше ограничить чтение и удаление, потому что пароль в `admin.js` виден в исходниках GitHub Pages. Минимально безопасный вариант — оставить запись публичной, а чтение и удаление выполнять только через отдельную защищённую админку или Firebase Auth.

## Пароль админки

Пароль находится в `admin.js`:

```js
const ADMIN_PASSWORD = "love-2026";
```

Замените его перед публикацией.

## Деплой на GitHub Pages

1. Загрузите файлы проекта в репозиторий.
2. Откройте `Settings -> Pages`.
3. В `Build and deployment` выберите `Deploy from a branch`.
4. Выберите ветку `main` и папку `/root`.
5. Откройте опубликованный URL.

## Локальный запуск

Проект статический. Можно открыть `index.html` напрямую в браузере, но из-за ES Modules лучше запускать через любой локальный сервер:

```bash
python -m http.server 8080
```

После этого откройте:

```text
http://localhost:8080
http://localhost:8080/admin.html
```

## Музыка

Фоновая музыка создаётся через Web Audio API и запускается только по нажатию кнопки. Это учитывает ограничения iPhone, Android и современных браузеров на автозапуск звука.
