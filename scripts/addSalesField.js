/**
 * Add a `sales` field (default 0) to every document inside the `info` collection.
 *
 * Usage:
 *   node scripts/addSalesField.js
 *
 * Notes:
 * - Uses the client Firestore SDK with the same configuration as the app.
 * - Skips documents that already contain a `sales` field.
 * - Commits updates in batches of 500 to respect Firestore limits.
 */
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
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

async function addSalesField() {
  try {
    console.log("Fetching documents from the `info` collection…");
    const infoSnapshot = await getDocs(collection(db, "info"));

    if (infoSnapshot.empty) {
      console.log("No documents found in `info`. Nothing to update.");
      return;
    }

    let batch = writeBatch(db);
    let operations = 0;
    let updated = 0;
    let skipped = 0;

    for (const docSnap of infoSnapshot.docs) {
      const data = docSnap.data();
      const hasSalesField = Object.prototype.hasOwnProperty.call(
        data,
        "sales"
      );

      if (hasSalesField && typeof data.sales === "number") {
        skipped += 1;
        continue;
      }

      batch.update(docSnap.ref, { sales: 0 });
      operations += 1;
      updated += 1;

      if (operations === 500) {
        await batch.commit();
        console.log(`Committed a batch of ${operations} updates.`);
        batch = writeBatch(db);
        operations = 0;
      }
    }

    if (operations > 0) {
      await batch.commit();
      console.log(`Committed a final batch of ${operations} updates.`);
    }

    console.log(`Done. Updated ${updated} document(s); skipped ${skipped}.`);
  } catch (error) {
    console.error("Failed to add `sales` field:", error);
    process.exitCode = 1;
  }
}

addSalesField();
