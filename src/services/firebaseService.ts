import { initializeApp } from "firebase/app";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseProdConfig = {
  apiKey: "AIzaSyDyoV4oFFFbXcSjUPeKbqpJrM1a1X12m_8",
  appId: "1:1006817124710:web:9825e70910a29b74f668a7",
  authDomain: "ccm-english.firebaseapp.com",
  measurementId: "G-BLXM5NVNYK",
  messagingSenderId: "1006817124710",
  projectId: "ccm-english",
  storageBucket: "ccm-english.appspot.com",
};

const firebaseDevConfig = {
  apiKey: "AIzaSyBWYcxes1Ozhp8XANNegcAQOFpvSDdab2k",
  appId: "1:563679619638:web:45465cd26144608fc3c697",
  authDomain: "ccm-english-dev.firebaseapp.com",
  measurementId: "G-TT5H32705E",
  messagingSenderId: "563679619638",
  projectId: "ccm-english-dev",
  storageBucket: "ccm-english-dev.appspot.com",
};

const tunisFirebaseConfig = {
  apiKey: "AIzaSyDFbxBsn8FoS1HsBqOXBJXBz5hpSPie4Wg",
  appId: "1:961509055519:web:79f3ae73c89003c153c92a",
  authDomain: "kallaline-tunis.firebaseapp.com",
  measurementId: "G-6X4BBTCTB5",
  messagingSenderId: "961509055519",
  projectId: "kallaline-tunis",
  storageBucket: "kallaline-tunis.appspot.com",
};

export const isProd =
  window.location.hostname.includes("ccm-english.web.app") ||
  window.location.hostname.includes("ccm-english.firebaseapp.com");

// Initialize Firebase
export const app = initializeApp(firebaseProdConfig);
// export const app = initializeApp(
//   // import.meta.env.VITE_PROJECT_NAME === "ccm-english" ?
//   isProd ? firebaseProdConfig : firebaseDevConfig,
//   // : tunisFirebaseConfig,
// );
export const db = getFirestore(app);
export const storage = getStorage(app);
enableIndexedDbPersistence(db);

export const studentImageFolder = "studentPics/";
export const covidVaccineImageFolder = "vaccineCertificates/";
