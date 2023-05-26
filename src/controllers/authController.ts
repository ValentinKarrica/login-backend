import User from "../models/userModel";
import { Response, Request, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    });
  }
);
