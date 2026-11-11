const authService = require('../services/auth.service');

class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register(name, email, password);
            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const cleanEmail = String(email || '').trim();
            const cleanPassword = String(password || '');

            const tokens = await authService.login(cleanEmail, cleanPassword);
            res.status(200).json(tokens);
        } catch (err) {
            next(err);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refresh(refreshToken);
            res.status(200).json(tokens);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();