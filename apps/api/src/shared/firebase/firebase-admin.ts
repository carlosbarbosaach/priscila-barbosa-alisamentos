import {
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { env } from "../../config/env.js";

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  env.GOOGLE_APPLICATION_CREDENTIALS;

export const firebaseAdminApp =
  getApps().length > 0
    ? getApp()
    : initializeApp({
        credential: applicationDefault(),
        projectId: env.FIREBASE_PROJECT_ID,
      });