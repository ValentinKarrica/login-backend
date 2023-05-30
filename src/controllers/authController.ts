import { Response, Request, NextFunction } from "express";
import User from "../models/userModel";
import jwt, { verify } from "jsonwebtoken";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { promisify } from "util";
import { JwtPayload } from "jsonwebtoken";

const getToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, lastName, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
      name,
      email,
      lastName,
      password,
      passwordConfirm,
    });

    const token = getToken(newUser._id);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // 3) If everything ok, send token to client
    const token = getToken(user._id);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: user,
      },
    });
  }
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError("You are not logged in! Please log in to get access.", 401)
      );
    }

    // 2) Token verification token
    const decoded = (await promisify(jwt.verify)(
      token,
      // @ts-ignore
      process.env.JWT_SECRET
    )) as JwtPayload;

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "The user belonging to this token does no longer exist.",
          401
        )
      );
    }

    // 4) Check if user changed password after the token was created
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password! Please log in again.",
          401
        )
      );
    }

    // ACCESS TO PROTECTED ROUTE
    next();
  }
);
