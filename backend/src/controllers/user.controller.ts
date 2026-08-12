/*
 * Copyright (c) 2026 thinkSDET. All rights reserved.
 */
import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user"
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, passwordHash, role } = req.body;

    if (!firstName || !lastName || !email || !passwordHash) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, email and passwordHash are required"
      });
    }

    const user = await userService.createUser({
      firstName,
      lastName,
      email,
      passwordHash,
      role
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create user"
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await userService.updateUser(id, req.body);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user"
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    await userService.deleteUser(id);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user"
    });
  }
};