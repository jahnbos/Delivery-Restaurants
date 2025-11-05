'use strict';

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'delivery-d48cc',
  });
}

const db = admin.firestore();

const batchSize = Number.parseInt(
  process.env.DELETE_BATCH_SIZE || '500',
  10
);

if (!Number.isFinite(batchSize) || batchSize <= 0) {
  throw new Error('DELETE_BATCH_SIZE must be a positive integer');
}

async function deleteBatch() {
  const snapshot = await db.collection('orders').limit(batchSize).get();

  if (snapshot.empty) {
    console.log('No orders documents remaining.');
    return false;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  console.log(`Deleted ${snapshot.size} orders documents.`);
  return snapshot.size === batchSize;
}

async function run() {
  try {
    while (await deleteBatch()) {
      // Keep pulling batches until the collection is empty.
    }
    console.log('Finished deleting orders collection.');
  } catch (error) {
    console.error('Failed to delete orders collection:', error);
    process.exitCode = 1;
  } finally {
    await admin.app().delete().catch(() => {
      /* ignore shutdown errors */
    });
  }
}

run();
