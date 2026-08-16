import { getAuth } from "firebase/auth";

import { firebaseApp } from "./client";

export const firebaseAuth = getAuth(firebaseApp);