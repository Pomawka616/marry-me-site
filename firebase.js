import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported, logEvent } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Вставьте сюда Firebase Config из Project settings -> General -> Your apps.
// После замены значений сайт готов к GitHub Pages без сборки и серверной части.
export const firebaseConfig = {
  apiKey: "AIzaSyA6bNhdujCOD-FUxDVlRvh_4RQYvZP7eVY",
  authDomain: "marry-me-site.firebaseapp.com",
  projectId: "marry-me-site",
  storageBucket: "marry-me-site.firebasestorage.app",
  messagingSenderId: "992851055795",
  appId: "1:992851055795:web:bb364df668767a40a68cc6",
  measurementId: "",
};

export const COLLECTION_NAME = "proposalAnswers";

const isConfigured = () =>
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith("PASTE_") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.startsWith("PASTE_");

let app;
let db;
let analyticsPromise;

export const getFirebase = () => {
  if (!isConfigured()) {
    throw new Error("Firebase Config не заполнен. Откройте firebase.js и вставьте реальные значения.");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    analyticsPromise = isSupported().then((supported) => (supported ? getAnalytics(app) : null));
  }

  return { app, db, analyticsPromise };
};

export const saveProposalAnswer = async (answer) => {
  const { db: firestore } = getFirebase();
  return addDoc(collection(firestore, COLLECTION_NAME), answer);
};

export const loadProposalAnswers = async () => {
  const { db: firestore } = getFirebase();
  const answersQuery = query(collection(firestore, COLLECTION_NAME), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(answersQuery);
  return snapshot.docs.map((answerDoc) => ({
    id: answerDoc.id,
    ...answerDoc.data(),
  }));
};

export const deleteProposalAnswer = async (id) => {
  const { db: firestore } = getFirebase();
  return deleteDoc(doc(firestore, COLLECTION_NAME, id));
};

export const trackProposalEvent = async (name, params = {}) => {
  try {
    const { analyticsPromise: analytics } = getFirebase();
    const analyticsInstance = await analytics;
    if (analyticsInstance) {
      logEvent(analyticsInstance, name, params);
    }
  } catch (error) {
    // Analytics не должен ломать романтический сценарий, особенно до вставки Firebase Config.
    console.info("Analytics skipped:", error.message);
  }
};
