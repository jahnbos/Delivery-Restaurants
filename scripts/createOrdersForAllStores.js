
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWwqaPGt1daPvTXy-I335H_oHq7VrexJs",
  authDomain: "delivery-d48cc.firebaseapp.com",
  projectId: "delivery-d48cc",
  storageBucket: "delivery-d48cc.firebasestorage.app",
  messagingSenderId: "1060852126985",
  appId: "1:1060852126985:web:7ec6bbd191ddb0f0a0afd8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createOrdersForAllStores = async () => {
  try {
    console.log("Fetching all stores from 'info' collection...");
    const infoCollection = collection(db, "info");
    const infoSnapshot = await getDocs(infoCollection);
    const storeIds = infoSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${storeIds.length} stores:`, storeIds);

    if (storeIds.length === 0) {
      console.log("No stores found in 'info' collection. Exiting.");
      return;
    }

    console.log("Creating sample orders for each store...");

    for (const storeId of storeIds) {
      // Create a pending order
      const pendingOrder = {
        storeId: storeId,
        customerName: "Test Customer",
        status: "pending",
        createdAt: serverTimestamp(),
        items: [
          { name: "Sample Item", price: 25, quantity: 1 },
        ],
        total: 25,
        queueNumber: Math.floor(Math.random() * 1000),
      };
      const pendingOrderRef = await addDoc(collection(db, "orders"), pendingOrder);
      console.log(`Created pending order ${pendingOrderRef.id} for store ${storeId}`);

      // Create a completed history order
      const completedOrder = {
        storeId: storeId,
        customerName: "History Customer",
        status: "completed",
        createdAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        items: [
          { name: "Historic Item", price: 100, quantity: 1 },
        ],
        total: 100,
        queueNumber: Math.floor(Math.random() * 1000),
      };
      const completedOrderRef = await addDoc(collection(db, "historyorders"), completedOrder);
      console.log(`Created completed order ${completedOrderRef.id} for store ${storeId}`);
    }

    console.log("Finished creating sample orders for all stores.");
    return true;
  } catch (e) {
    console.error("Error creating orders for all stores: ", e);
    return false;
  }
};

createOrdersForAllStores().then((success) => {
    if (success) {
        console.log("Script finished successfully.");
    } else {
        console.log("Script finished with errors.");
    }
}).catch(e => {
    console.error(e);
});
