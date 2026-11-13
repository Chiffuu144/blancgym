import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { calculateDailyCalories } from '../utils/calorieCalculator.js';
import crypto from 'node:crypto';

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  profileImage: user.profileImage || '',
  username: user.username,
  email: user.email,
  gender: user.gender,
  age: user.age,
  weightKg: user.weightKg,
  heightCm: user.heightCm,
  experience: user.experience,
  workoutFrequency: user.workoutFrequency,
  goal: user.goal,
  bmr: user.bmr,
  tdee: user.tdee,
  targetDailyCalories: user.targetDailyCalories
});
const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export async function register(req, res, next) {
  try {
    const { username, email, password, gender, age, weightKg, heightCm, experience, workoutFrequency, goal } = req.body;
    if (!username?.trim() || !email?.trim() || !password || !gender || age == null || weightKg == null || heightCm == null || !experience || !workoutFrequency || !goal) {
      return res.status(400).json({ message: 'Please complete every step of your profile.' });
    }
    if (!['Male', 'Female'].includes(gender)) return res.status(400).json({ message: 'Choose Male or Female.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ message: 'Enter a valid email address.' });
    const normalizedUsername = username.toLowerCase().trim();
    if (!/^[a-z0-9_]{3,32}$/.test(normalizedUsername)) return res.status(400).json({ message: 'Username must be 3-32 characters using letters, numbers, or underscores.' });
    const numericProfile = { age: Number(age), weightKg: Number(weightKg), heightCm: Number(heightCm) };
    if (!Number.isInteger(numericProfile.age) || numericProfile.age < 18 || numericProfile.age > 100) return res.status(400).json({ message: 'Age must be between 18 and 100.' });
    if (!Number.isFinite(numericProfile.weightKg) || numericProfile.weightKg < 30 || numericProfile.weightKg > 350) return res.status(400).json({ message: 'Enter a weight between 30 and 350 kg.' });
    if (!Number.isFinite(numericProfile.heightCm) || numericProfile.heightCm < 120 || numericProfile.heightCm > 230) return res.status(400).json({ message: 'Enter a height between 120 and 230 cm.' });
    if (!['starting', '6-months', '2-years'].includes(experience)) return res.status(400).json({ message: 'Choose an experience level.' });
    if (!['1-2', '3-5', 'daily'].includes(workoutFrequency)) return res.status(400).json({ message: 'Choose a weekly workout frequency.' });
    if (!['fat-loss', 'build-muscle', 'maintain-weight'].includes(goal)) return res.status(400).json({ message: 'Choose a fitness goal.' });
    const normalizedEmail = email.toLowerCase().trim();
    const [emailExists, usernameExists] = await Promise.all([
      User.exists({ email: normalizedEmail }),
      User.exists({ username: normalizedUsername })
    ]);
    if (emailExists) return res.status(409).json({ message: 'An account with this email already exists.' });
    if (usernameExists) return res.status(409).json({ message: 'That username is already taken.' });
    const calorieProfile = calculateDailyCalories({ ...numericProfile, gender, workoutFrequency, goal });
    const user = await User.create({
      name: normalizedUsername,
      username: normalizedUsername,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      gender,
      ...numericProfile,
      experience,
      workoutFrequency,
      goal,
      ...calorieProfile
    });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function me(req, res) { res.json({ user: publicUser(req.user) }); }

export async function updateProfile(req, res, next) {
  try {
    const allowed = ['username', 'gender', 'age', 'weightKg', 'heightCm', 'experience', 'workoutFrequency', 'goal', 'profileImage', 'featuredPhotos'];
    const updates = Object.fromEntries(allowed.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]));
    if (updates.username !== undefined) {
      updates.username = String(updates.username).trim().toLowerCase();
      if (!/^[a-z0-9_]{3,32}$/.test(updates.username)) return res.status(400).json({ message: 'Username must be 3-32 characters using letters, numbers, or underscores.' });
    }
    if (updates.profileImage !== undefined && updates.profileImage && (!/^data:image\/(jpeg|png|webp);base64,/.test(updates.profileImage) || updates.profileImage.length > 2_000_000)) return res.status(400).json({ message: 'Profile photo must be a JPG, PNG, or WebP under 1.5 MB.' });
    if (updates.featuredPhotos !== undefined && (!Array.isArray(updates.featuredPhotos) || updates.featuredPhotos.length > 4 || updates.featuredPhotos.some(photo => typeof photo !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(photo) || photo.length > 1_500_000))) return res.status(400).json({ message: 'Choose up to 4 JPG, PNG, or WebP featured photos.' });
    const numeric = ['age', 'weightKg', 'heightCm'];
    for (const key of numeric) if (updates[key] !== undefined) updates[key] = Number(updates[key]);
    if (updates.age !== undefined && (!Number.isInteger(updates.age) || updates.age < 18 || updates.age > 100)) return res.status(400).json({ message: 'Age must be between 18 and 100.' });
    if (updates.weightKg !== undefined && (!Number.isFinite(updates.weightKg) || updates.weightKg < 30 || updates.weightKg > 350)) return res.status(400).json({ message: 'Weight must be between 30 and 350 kg.' });
    if (updates.heightCm !== undefined && (!Number.isFinite(updates.heightCm) || updates.heightCm < 120 || updates.heightCm > 230)) return res.status(400).json({ message: 'Height must be between 120 and 230 cm.' });
    if (updates.gender !== undefined && !['Male', 'Female'].includes(updates.gender)) return res.status(400).json({ message: 'Choose Male or Female.' });
    if (updates.experience !== undefined && !['starting', '6-months', '2-years'].includes(updates.experience)) return res.status(400).json({ message: 'Choose an experience level.' });
    if (updates.workoutFrequency !== undefined && !['1-2', '3-5', 'daily'].includes(updates.workoutFrequency)) return res.status(400).json({ message: 'Choose a weekly workout frequency.' });
    if (updates.goal !== undefined && !['fat-loss', 'build-muscle', 'maintain-weight'].includes(updates.goal)) return res.status(400).json({ message: 'Choose a fitness goal.' });
    const profile = { ...req.user.toObject(), ...updates };
    const calorieProfile = calculateDailyCalories(profile);
    Object.assign(updates, calorieProfile);
    Object.assign(req.user, updates);
    const user = await req.user.save();
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
}

export async function requestPasswordReset(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'If that account exists, a reset request is ready.' });
    const code = crypto.randomInt(100000, 1000000).toString();
    user.passwordResetCodeHash = crypto.createHash('sha256').update(code).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    // This project has no email delivery configured. Expose the one-time code only for local development.
    res.json({ message: process.env.NODE_ENV === 'production' ? 'Reset delivery is not configured yet. Please contact support.' : 'Use this one-time code to reset your password. It expires in 15 minutes.', ...(process.env.NODE_ENV === 'production' ? {} : { developmentCode: code }) });
  } catch (error) { next(error); }
}

export async function resetPassword(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const code = String(req.body.code || '').trim();
    const password = String(req.body.password || '');
    if (!/^\d{6}$/.test(code) || password.length < 8) return res.status(400).json({ message: 'Enter the 6-digit code and a password of at least 8 characters.' });
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const user = await User.findOne({ email, passwordResetCodeHash: codeHash, passwordResetExpires: { $gt: new Date() } }).select('+passwordResetCodeHash +passwordResetExpires');
    if (!user) return res.status(400).json({ message: 'That code is invalid or expired. Request a new one.' });
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetCodeHash = undefined; user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can sign in now.' });
  } catch (error) { next(error); }
}
