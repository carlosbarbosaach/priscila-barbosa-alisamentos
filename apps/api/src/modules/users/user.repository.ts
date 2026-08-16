import type { UserRole } from "@priscila/shared";

import { firestore } from "../../shared/firebase/firebase-firestore.js";

import type {
  UserDocument,
  UserEntity,
} from "./user.types.js";

const COLLECTION_NAME = "users";

export class UserRepository {
  async findById(
    userId: string,
  ): Promise<UserEntity | null> {
    const snapshot = await firestore
      .collection(COLLECTION_NAME)
      .doc(userId)
      .get();

    if (!snapshot.exists) {
      return null;
    }

    const data = snapshot.data() as UserDocument;

    return {
      id: snapshot.id,
      ...data,
    };
  }

  async create(
    userId: string,
    data: UserDocument,
  ): Promise<void> {
    await firestore
      .collection(COLLECTION_NAME)
      .doc(userId)
      .create(data);
  }

  async updateRole(
    userId: string,
    role: UserRole,
    updatedAt: UserDocument["updatedAt"],
  ): Promise<void> {
    await firestore
      .collection(COLLECTION_NAME)
      .doc(userId)
      .update({
        role,
        updatedAt,
      });
  }
}