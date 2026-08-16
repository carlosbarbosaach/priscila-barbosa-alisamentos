import {
    getApp,
    getApps,
    initializeApp,
} from "firebase/app";

import { firebaseConfig } from "./config";

export const firebaseApp =
    getApps().length > 0
        ? getApp()
        : initializeApp(firebaseConfig);