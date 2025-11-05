
const { initializeApp } = require("firebase/app");

const { getFirestore, collection, query, where, getDocs, writeBatch } = require("firebase/firestore");



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



const deleteCompletedOrders = async () => {

  try {

    const ordersRef = collection(db, "orders");

    const q = query(ordersRef, where("status", "==", "completed"));

    
    const querySnapshot = await getDocs(q);


    if (querySnapshot.empty) {

      console.log("No completed orders found to delete.");

      return;

    }



    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {

      batch.delete(doc.ref);

    });



    await batch.commit();

    console.log(`Successfully deleted ${querySnapshot.size} completed orders.`);

  } catch (error) {

    console.error("Error deleting completed orders: ", error);

  }

};



deleteCompletedOrders();
