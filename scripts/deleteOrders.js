import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

// ✅ ใส่ค่าคอนฟิก Firebase ของคุณตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyAWwqaPGt1daPvTXy-I335H_oHq7VrexJs",
  authDomain: "delivery-d48cc.firebaseapp.com",
  projectId: "delivery-d48cc",
  storageBucket: "delivery-d48cc.firebasestorage.app",
  messagingSenderId: "1060852126985",
  appId: "1:1060852126985:web:7ec6bbd191ddb0f0a0afd8",
};

// 🔥 เริ่มต้นเชื่อมต่อ Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllOrders() {
  const ordersRef = collection(db, "orders");
  const snapshot = await getDocs(ordersRef);

  const total = snapshot.size;
  console.log(`🧾 พบ ${total} orders`);

  for (const document of snapshot.docs) {
    await deleteDoc(doc(db, "orders", document.id));
    console.log(`🗑️ ลบแล้ว: ${document.id}`);
  }

  console.log("✅ ลบข้อมูล orders ทั้งหมดเรียบร้อยแล้ว!");
}

deleteAllOrders().catch(console.error);
