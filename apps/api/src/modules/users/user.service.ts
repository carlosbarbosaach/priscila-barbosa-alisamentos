import {
  USER_ROLES,
  type AppUser,
} from "@priscila/shared";
import { Timestamp } from "firebase-admin/firestore";

import { env } from "../../config/env.js";
import { SalonRepository } from "../salons/salon.repository.js";

import { mapUserEntityToAppUser } from "./user.mapper.js";
import { UserRepository } from "./user.repository.js";

type EnsureUserInput = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
};

export class UserService {
  constructor(
    private readonly userRepository =
      new UserRepository(),

    private readonly salonRepository =
      new SalonRepository(),
  ) {}

  async findById(
    userId: string,
  ): Promise<AppUser | null> {
    const user =
      await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return mapUserEntityToAppUser(user);
  }

  async ensureClientUser(
    input: EnsureUserInput,
  ): Promise<AppUser> {
    const existingUser =
      await this.userRepository.findById(input.id);

    if (existingUser) {
      return mapUserEntityToAppUser(
        existingUser,
      );
    }

    const salon =
      await this.salonRepository.findById(
        env.DEFAULT_SALON_ID,
      );

    if (!salon) {
      throw new Error(
        "O salão padrão configurado não existe.",
      );
    }

    if (!salon.active) {
      throw new Error(
        "O salão padrão está inativo.",
      );
    }

    const now = Timestamp.now();

    await this.userRepository.create(
      input.id,
      {
        salonId: salon.id,

        role: USER_ROLES.CLIENT,
        active: true,

        email: input.email,
        displayName: input.displayName,
        photoUrl: input.photoUrl,

        createdAt: now,
        updatedAt: now,
      },
    );

    const createdUser =
      await this.userRepository.findById(
        input.id,
      );

    if (!createdUser) {
      throw new Error(
        "Não foi possível localizar o usuário após a criação.",
      );
    }

    return mapUserEntityToAppUser(
      createdUser,
    );
  }

  async promoteToAdmin(
    userId: string,
  ): Promise<AppUser> {
    const user =
      await this.userRepository.findById(userId);

    if (!user) {
      throw new Error(
        "Usuário não encontrado.",
      );
    }

    if (!user.active) {
      throw new Error(
        "Não é possível promover um usuário inativo.",
      );
    }

    if (user.role === USER_ROLES.ADMIN) {
      return mapUserEntityToAppUser(user);
    }

    await this.userRepository.updateRole(
      userId,
      USER_ROLES.ADMIN,
      Timestamp.now(),
    );

    const updatedUser =
      await this.userRepository.findById(
        userId,
      );

    if (!updatedUser) {
      throw new Error(
        "Não foi possível localizar o usuário após a promoção.",
      );
    }

    return mapUserEntityToAppUser(
      updatedUser,
    );
  }
}