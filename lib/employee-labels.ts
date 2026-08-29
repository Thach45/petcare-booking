import { EmployeeRole } from "@prisma/client";

export const employeeRoleLabel: Record<EmployeeRole, string> = {
  GROOMER: "Groomer",
  VET: "Bác sĩ thú y",
  RECEPTIONIST: "Lễ tân",
  MANAGER: "Quản lý",
};

export const employeeRoles = Object.values(EmployeeRole);
