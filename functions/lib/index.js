"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDeleted = exports.submitFeedback = exports.sendPoke = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const googleapis_1 = require("googleapis");
admin.initializeApp();
const db = admin.firestore();
const POKE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const MAX_MESSAGE_LENGTH = 80;
const DEFAULT_MESSAGE = 'Your friend gave you a nudge 🚽';
exports.sendPoke = functions
    .region('asia-southeast1')
    .https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const senderId = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!senderId) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }
    const { recipientId, message } = data;
    if (!recipientId || typeof recipientId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'recipientId is required.');
    }
    if (senderId === recipientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Cannot poke yourself.');
    }
    const pokeMessage = typeof message === 'string' && message.trim().length > 0
        ? message.trim().slice(0, MAX_MESSAGE_LENGTH)
        : DEFAULT_MESSAGE;
    // Verify accepted friendship (check sender's side)
    const friendshipSnap = await db
        .doc(`friendships/${senderId}/friends/${recipientId}`)
        .get();
    if (!friendshipSnap.exists || ((_b = friendshipSnap.data()) === null || _b === void 0 ? void 0 : _b.status) !== 'accepted') {
        throw new functions.https.HttpsError('permission-denied', 'You are not friends with this user.');
    }
    // Check recipient allows pokes
    const recipientSnap = await db.doc(`users/${recipientId}`).get();
    const recipientData = recipientSnap.data();
    if (!recipientData)
        throw new functions.https.HttpsError('not-found', 'Recipient not found.');
    if (recipientData.allowPokes === false) {
        throw new functions.https.HttpsError('permission-denied', 'This user has disabled pokes.');
    }
    // Rate limit — one poke per sender-recipient pair per 30 minutes
    const pokeId = `${senderId}_${recipientId}`;
    const pokeRef = db.doc(`pokes/${pokeId}`);
    const pokeSnap = await pokeRef.get();
    if (pokeSnap.exists) {
        const lastSentAt = (_e = (_d = (_c = pokeSnap.data()) === null || _c === void 0 ? void 0 : _c.sentAt) === null || _d === void 0 ? void 0 : _d.toMillis()) !== null && _e !== void 0 ? _e : 0;
        const elapsed = Date.now() - lastSentAt;
        if (elapsed < POKE_COOLDOWN_MS) {
            const remaining = Math.ceil((POKE_COOLDOWN_MS - elapsed) / 60000);
            throw new functions.https.HttpsError('resource-exhausted', `You can poke again in ${remaining} minute${remaining === 1 ? '' : 's'}.`);
        }
    }
    // Get sender's username for the notification
    const senderSnap = await db.doc(`users/${senderId}`).get();
    const senderUsername = (_g = (_f = senderSnap.data()) === null || _f === void 0 ? void 0 : _f.username) !== null && _g !== void 0 ? _g : 'Someone';
    // Send FCM push to recipient's device — failure is non-fatal
    const fcmToken = recipientData.fcmToken;
    if (fcmToken) {
        try {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: `${senderUsername} poked you 🚽`,
                    body: pokeMessage,
                },
                apns: {
                    payload: { aps: { sound: 'default' } },
                },
            });
        }
        catch (e) {
            console.warn('FCM send failed (stale or invalid token):', e);
        }
    }
    // Record poke for rate limiting
    await pokeRef.set({
        senderId,
        recipientId,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        message: pokeMessage,
    });
    return { success: true };
});
const FEEDBACK_SHEET_ID = '1g5sshisjUGF9MXE8U8Mng1zBAIBSW3RL-2TlKfkABJM';
async function appendFeedbackRow(row) {
    const auth = new googleapis_1.google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
        spreadsheetId: FEEDBACK_SHEET_ID,
        range: 'Sheet1!A:E',
        valueInputOption: 'RAW',
        requestBody: { values: [row] },
    });
}
exports.submitFeedback = functions
    .region('asia-southeast1')
    .https.onCall(async (data, context) => {
    var _a;
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid)
        throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    const { type, topic, freeText, username, email, platform, deviceModel, appVersion } = data;
    if (type !== 'deletion' && type !== 'general') {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid feedback type.');
    }
    const row = [
        new Date().toISOString(),
        uid,
        username !== null && username !== void 0 ? username : '',
        email !== null && email !== void 0 ? email : '',
        platform !== null && platform !== void 0 ? platform : '',
        deviceModel !== null && deviceModel !== void 0 ? deviceModel : '',
        appVersion !== null && appVersion !== void 0 ? appVersion : '',
        type,
        topic !== null && topic !== void 0 ? topic : '',
        freeText !== null && freeText !== void 0 ? freeText : '',
    ];
    await appendFeedbackRow(row);
    return { success: true };
});
exports.onUserDeleted = functions
    .region('asia-southeast1')
    .auth.user()
    .onDelete(async (user) => {
    const uid = user.uid;
    // Query usernameIndex directly by userId — avoids recomputing the hash
    // and works even if the profile doc was already gone.
    const indexSnap = await db.collection('usernameIndex').where('userId', '==', uid).get();
    await Promise.all(indexSnap.docs.map(d => d.ref.delete()));
    // Delete all subcollections
    const subcollections = ['logs', 'dailySummaries', 'monthlyTotals', 'yearlyTotals', 'dismissedSignals'];
    await Promise.all(subcollections.map(async (sub) => {
        const snap = await db.collection(`users/${uid}/${sub}`).get();
        await Promise.all(snap.docs.map(d => d.ref.delete()));
    }));
    // Remove this user from every friend's list, then delete own friendship docs
    const friendsSnap = await db.collection(`friendships/${uid}/friends`).get();
    await Promise.all([
        ...friendsSnap.docs.map(d => db.doc(`friendships/${d.id}/friends/${uid}`).delete()),
        ...friendsSnap.docs.map(d => d.ref.delete()),
    ]);
    // Delete profile doc (no-op if it never existed)
    await db.doc(`users/${uid}`).delete();
});
//# sourceMappingURL=index.js.map