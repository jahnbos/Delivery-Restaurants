/**
 * Add a `status` field (default 'active') to every menu item inside the `info` collection.
 *
 * Usage:
 *   node scripts/addStatusToMenu.js
 *
 * Notes:
 * - Uses the client Firestore SDK with the same configuration as the app.
 * - Skips menu items that already contain a `status` field.
 * - Updates documents individually.
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAWwqaPGt1daPvTXy-I335H_oHq7VrexJs",
  authDomain: "delivery-d48cc.firebaseapp.com",
  projectId: "delivery-d48cc",
  storageBucket: "delivery-d48cc.firebasestorage.app",
  messagingSenderId: "1060852126985",
  appId: "1:1060852126985:web:7ec6bbd191ddb0f0a0afd8",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addStatusToMenu() {
  try {
    console.log("Fetching documents from the `info` collection…");
    const infoSnapshot = await getDocs(collection(db, "info"));

    if (infoSnapshot.empty) {
      console.log("No documents found in `info`. Nothing to update.");
      return;
    }

    let updatedDocs = 0;
    let skippedDocs = 0;

    for (const docSnap of infoSnapshot.docs) {
      const data = docSnap.data();
      let shouldUpdate = false;

      if (data.menu && Array.isArray(data.menu)) {
        const newMenu = data.menu.map((item) => {
          if (Object.prototype.hasOwnProperty.call(item, "status")) {
            return item;
          }
          shouldUpdate = true;
          return { ...item, status: "active" };
        });

        if (shouldUpdate) {
          await updateDoc(doc(db, "info", docSnap.id), { menu: newMenu });
          updatedDocs++;
        } else {
          skippedDocs++;
        }
      } else {
        skippedDocs++;
      }
    }

    console.log(`Done. Updated ${updatedDocs} document(s); skipped ${skippedDocs}.`);
  } catch (error) {
    console.error("Failed to add `status` field to menu items:", error);
    process.exitCode = 1;
  }
}

addStatusToMenu();
