import { getFirestore } from "firebase-admin/firestore";

import { firebaseAdminApp } from "./firebase-admin.js";

export const firestore = getFirestore(firebaseAdminApp);