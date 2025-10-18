import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to calculate hours between two timestamps
const calculateHours = (start: Date, end: Date): number => {
  const diff = end.getTime() - start.getTime();
  return Number((diff / (1000 * 60 * 60)).toFixed(2));
};

// Helper to get start and end of today
const getTodayRange = () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

// Check In (Regular)
export const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existing && existing.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = existing
      ? await prisma.attendance.update({
          where: { id: existing.id },
          data: { checkIn: new Date(), status: 'PRESENT' },
        })
      : await prisma.attendance.create({
          data: {
            userId,
            checkIn: new Date(),
            status: 'PRESENT',
          },
        });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Check Out (Regular)
export const checkOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        checkIn: { not: null },
        checkOut: null,
      },
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in record found' });
    }

    const checkOutTime = new Date();
    const workHours = calculateHours(attendance.checkIn!, checkOutTime);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
        workHours,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// OT Check In
export const otCheckIn = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'Please check in for regular shift first' });
    }

    if (attendance.otCheckIn) {
      return res.status(400).json({ success: false, message: 'Already checked in for OT' });
    }

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { otCheckIn: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('OT check in error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// OT Check Out
export const otCheckOut = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        otCheckIn: { not: null },
        otCheckOut: null,
      },
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No OT check-in record found' });
    }

    const otCheckOutTime = new Date();
    const otHours = calculateHours(attendance.otCheckIn!, otCheckOutTime);

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        otCheckOut: otCheckOutTime,
        otHours,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('OT check out error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's attendance
export const getMyAttendance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all attendance (Admin only)
export const getAllAttendance = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
            designation: true,
          },
        },
      },
      orderBy: { checkIn: 'asc' },
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get today's status
export const getTodayStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { startOfDay, endOfDay } = getTodayRange();

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    res.json({ success: true, data: attendance || null });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
