import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";

export const getUser = catchAsync(async (req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This rout is not yet defined",
  });
});

export const updateUser = (req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This rout is not yet defined",
  });
};

export const deleteUser = (req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    status: "error",
    message: "This rout is not yet defined",
  });
};
