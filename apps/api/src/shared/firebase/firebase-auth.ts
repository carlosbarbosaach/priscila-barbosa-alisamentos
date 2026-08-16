import { getAuth } from "firebase-admin/auth";

import { firebaseAdminApp } from "./firebase-admin.js";

export const firebaseAdminAuth = getAuth(firebaseAdminApp);