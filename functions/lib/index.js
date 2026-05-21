"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPoke = void 0;
const admin = require("firebase-admin");
const functions = require("firebase-functions");
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
//# sourceMappingURL=index.js.map