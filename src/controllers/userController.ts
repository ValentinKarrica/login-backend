import { Request, Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";

const sendResponse = (
  user: any,
  statusCode: number,
  req: Request,
  res: Response
) => {
  // Remove password & __v from output
  user.password = undefined;
  user.__v = undefined;
  res.status(statusCode).json({
    status: "success",
    data: {
      user,
    },
  });
};
export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const { user, params } = req;
    if (!(user._id.toString() === params.id)) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }
    sendResponse(user, 201, req, res);
  }
);

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
