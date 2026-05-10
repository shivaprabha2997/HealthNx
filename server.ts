import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import prisma from './src/lib/prisma';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET =
  process.env.JWT_SECRET || 'healthnexus-secret-key-2024';

const PORT = 3000;

// =======================
// START SERVER
// =======================
async function startServer() {
  const app = express();

  app.use(express.json());

  // =======================
  // JWT Middleware
  // =======================
  const authenticateToken = (
    req: any,
    res: any,
    next: any
  ) => {
    const authHeader = req.headers['authorization'];

    const token =
      authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      });
    }

    jwt.verify(
      token,
      JWT_SECRET,
      (err: any, user: any) => {
        if (err) {
          return res.status(403).json({
            message: 'Forbidden',
          });
        }

        req.user = user;

        next();
      }
    );
  };

  // =======================
  // AUTH SIGNUP
  // =======================
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        role = 'patient',
      } = req.body;

      const existingUser =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already exists',
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const newUser =
        await prisma.user.create({
          data: {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role,
          },
        });

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        JWT_SECRET
      );

      res.json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Server Error',
      });
    }
  });

  // =======================
  // AUTH LOGIN
  // =======================
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (!user) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        return res.status(401).json({
          message: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Server Error',
      });
    }
  });

  // =======================
  // GET DOCTORS
  // =======================
  app.get('/api/doctors', async (req, res) => {
    try {
      const doctors =
        await prisma.doctor.findMany();

      res.json(doctors);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Server Error',
      });
    }
  });

  // =======================
  // GET MEDICINES
  // =======================
  app.get('/api/medicines', async (req, res) => {
    try {
      const medicines =
        await prisma.medicine.findMany();

      res.json(medicines);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: 'Server Error',
      });
    }
  });

  // =======================
  // CREATE APPOINTMENT
  // =======================
  app.post(
    '/api/appointments',
    authenticateToken,
    async (req: any, res) => {
      try {
        const {
          doctorId,
          date,
          time,
        } = req.body;

        const appointment =
          await prisma.appointment.create({
            data: {
              id: Date.now().toString(),
              userId: req.user.id,
              doctorId,
              date,
              time,
              status: 'scheduled',
            },
          });

        res.json(appointment);
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Server Error',
        });
      }
    }
  );

  // =======================
  // USER APPOINTMENTS
  // =======================
  app.get(
    '/api/user/appointments',
    authenticateToken,
    async (req: any, res) => {
      try {
        const appointments =
          await prisma.appointment.findMany({
            where: {
              userId: req.user.id,
            },
            include: {
              doctor: true,
            },
          });

        res.json(appointments);
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Server Error',
        });
      }
    }
  );

  // =======================
  // CREATE ORDER
  // =======================
  app.post(
    '/api/orders',
    authenticateToken,
    async (req: any, res) => {
      try {
        const { total } = req.body;

        const order =
          await prisma.order.create({
            data: {
              id: Date.now().toString(),
              userId: req.user.id,
              total,
              date: new Date(),
              status: 'processing',
            },
          });

        res.json(order);
      } catch (error) {
        console.error(error);

        res.status(500).json({
          message: 'Server Error',
        });
      }
    }
  );

  // =======================
  // VITE
  // =======================
  if (process.env.NODE_ENV !== 'production') {
    const vite =
      await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(
      process.cwd(),
      'dist'
    );

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(
        path.join(distPath, 'index.html')
      );
    });
  }

  // =======================
  // START SERVER
  // =======================
  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `🚀 Server running on http://localhost:${PORT}`
    );
  });
}

startServer();