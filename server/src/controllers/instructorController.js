import { Instructor } from '../models/Instructor.js';
import bcrypt from 'bcryptjs';

function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role,
    apiKey: doc.apiKey,
    privateEmail: doc.privateEmail,
    privatePhone: doc.privatePhone
  };
}

export async function loginInstructor(req, res, next) {
  try {
    const { username, password } = req.body;

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input format for username or password' });
    }

    if (!username.trim() || !password) {
      return res.status(400).json({ message: 'username and password are required' });
    }

    const instructor = await Instructor.findOne({ username }).select('+password');

    if (!instructor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, instructor.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ instructor: publicProfile(instructor) });
  } catch (err) {
    next(err);
  }
}

export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();
    res.json({ instructors });
  } catch (err) {
    next(err);
  }
}export async function searchInstructors(req, res, next) {
  try {
    const filter = {};

    if (req.query.name && typeof req.query.name === 'string') {
      filter.name = { $regex: req.query.name, $options: 'i' };
    }

    if (req.query.department && typeof req.query.department === 'string') {
      filter.department = req.query.department;
    }

    if (req.query.role && typeof req.query.role === 'string') {
      filter.role = req.query.role;
    }

    const instructors = await Instructor.find(filter)
      .select('name department role')
      .lean();

    res.json({ count: instructors.length, instructors });
  } catch (err) {
    next(err);
  }
}