"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-time script to delete usernameIndex entries with no matching users/{uid} doc.
 * Run from the functions/ directory:
 *   npx ts-node src/cleanupUsernameIndex.ts
 */
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
async function run() {
    const indexSnap = await db.collection('usernameIndex').get();
    console.log(`Found ${indexSnap.size} usernameIndex entries.`);
    let deleted = 0;
    for (const doc of indexSnap.docs) {
        const userId = doc.data().userId;
        if (!userId) {
            await doc.ref.delete();
            console.log(`Deleted entry with missing userId: ${doc.id}`);
            deleted++;
            continue;
        }
        const userSnap = await db.doc(`users/${userId}`).get();
        if (!userSnap.exists) {
            await doc.ref.delete();
            console.log(`Deleted orphaned entry: ${doc.id} (userId: ${userId})`);
            deleted++;
        }
    }
    console.log(`Done. Deleted ${deleted} orphaned entr${deleted === 1 ? 'y' : 'ies'}.`);
    process.exit(0);
}
run().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=cleanupUsernameIndex.js.map