import { body } from "express-validator";

export const registerValidator = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required")
        .isLength({ min: 2, max: 30 })
        .withMessage("First name must be between 2 and 30 characters"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required")
        .isLength({ min: 2, max: 30 })
        .withMessage("Last name must be between 2 and 30 characters"),

    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Password must contain one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain one number")
        .matches(/[!@#$%^&*]/)
        .withMessage("Password must contain one special character"),

    body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {

            if (value !== req.body.password) {

                throw new Error("Passwords do not match");

            }

            return true;

        })

];

export const loginValidator = [

    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid Email"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")

];