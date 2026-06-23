import { Router } from 'express';
import { validateRegisterUser, validateLoginUser } from '../validator/auth.validator.js';
import { register, login, googleCallback } from '../controllers/auth.controller.js';
import { config } from '../config/config.js';
import passport from 'passport';


const router = Router();

router.post('/register', validateRegisterUser, register);
router.post("/login",validateLoginUser, login)

// /api/auth/google
router.get("/google",
    passport.authenticate("google", { scope: [ "profile", "email" ] }))

router.get("/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    googleCallback,
)


export default router;
