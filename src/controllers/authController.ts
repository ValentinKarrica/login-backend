import { Response, Request, NextFunction } from "express";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { promisify } from "util";
import { JwtPayload } from "jsonwebtoken";

//Get Token form jwt
const getToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (
  user: any,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = getToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 120 * 60 * 1000),
    httpOnly: true,
    secure: false,
    // secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password & __v from output
  user.password = undefined;
  user.__v = undefined;
  res.status(statusCode).json({
    status: "success",

    // token,    <<<<------- Using cookies to send token
    user,
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
    createSendToken(newUser, 201, req, res);
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
      return next(new AppError("Incorrect email or password", 400));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
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

    // @ts-ignore
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  }
);

export const verifyToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
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

    //Verify token success
    currentUser.password = undefined;
    currentUser.__v = undefined;

    createSendToken(currentUser, 200, req, res);
  }
);

export const updatePassword = catchAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1) Get user from collection

  //@ts-ignore
  const user = await User.findById(req.user.id).select("+password");

  // 2) Check if POSTed current password is correct

  if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
    return next(new AppError("Your current password is wrong!", 400));
  }
  // 3) If so, update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});