import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get all employees (only EMPLOYEE role, not ADMIN)
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE', // Only get users with EMPLOYEE role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        designation: true,
        salary: true,
        phone: true,
        address: true,
        joiningDate: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('Employees found:', employees.length);
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single employee
export const getEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        designation: true,
        salary: true,
        phone: true,
        address: true,
        joiningDate: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create employee
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, employeeId, department, designation, salary, phone, address, joiningDate } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        employeeId,
        department,
        designation,
        salary: salary ? parseFloat(salary) : null,
        phone,
        address,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        designation: true,
        salary: true,
        phone: true,
        address: true,
        joiningDate: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update employee
export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, employeeId, department, designation, salary, phone, address, joiningDate } = req.body;

    const employee = await prisma.user.update({
      where: { id },
      data: {
        name,
        employeeId,
        department,
        designation,
        salary: salary ? parseFloat(salary) : undefined,
        phone,
        address,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        designation: true,
        salary: true,
        phone: true,
        address: true,
        joiningDate: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete employee permanently with cascade
export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({
      where: { id },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (employee.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await prisma.$transaction([
      prisma.attendance.deleteMany({ where: { userId: id } }),
      prisma.task.deleteMany({ where: { assignedToId: id } }),
      prisma.task.deleteMany({ where: { createdById: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
};

// Toggle employee status (not used/UI hides this)
export const toggleEmployeeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const employee = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !employee.isActive },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};
