import User from '../models/User';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { sendResponse } from '../utils/responseUtils';
import JwtService from '../utils/jwt';
class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, fullName, password } = req.body;

      if (!username || !email || !fullName || !password) {
        return sendResponse(res, 400, { message: 'All fields are required' });
      }

      // Валидация email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return sendResponse(res, 400, { message: 'Invalid email format' });
      }

      // Валидация пароля (длина, цифры, заглавные буквы и спецсимволы)
      const passwordRegex = /^[A-Za-z\d@$!%*?&]{8,12}$/;
      if (!passwordRegex.test(password)) {
        return sendResponse(res, 400, {
          message:
            'Password must be at least 8 characters long, include uppercase letters, lowercase letters, numbers, and special characters',
        });
      }

      // Валидация полного имени (допустимы только буквы и пробелы)
      const fullNameRegex = /^[a-zA-Zа-яА-ЯёЁ\s]+$/;
      if (!fullNameRegex.test(fullName)) {
        return sendResponse(res, 400, {
          message: 'Full name must contain only letters and spaces',
        });
      }

      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return sendResponse(res, 400, {
          message: 'User with this username or email already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        fullName,
        password: hashedPassword,
      });

      await newUser.save();

      return sendResponse(res, 201, {
        message: 'User registered successfully',
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;
      if ((!username && !password) || (!email && !password)) {
        return sendResponse(res, 400, {
          message: 'Oll feild are required',
        });
      }
      const user = await User.findOne({ $or: [{ username }, { email }] });
      if (!user) {
        return sendResponse(res, 400, { message: 'Invalid credentials' });
      }
      const token = JwtService.generateToken({
        id: user._id,
        username: user.username,
        role: user.role,
      });
      return sendResponse(res, 200, {
        message: 'Login successful',
        token,
        data: {
          id: user._id,
          username: user.username,
        },
      });
    } catch (error) {
      console.error(error);
      return sendResponse(res, 500, { message: 'Server error' });
    }
  }
}

export default AuthController;
