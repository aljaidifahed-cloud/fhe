import { UserRole, Permission } from '../types';

export const getDefaultPermissions = (role: UserRole): Record<string, boolean> => {
    const permissions: Record<string, boolean> = {};

    // Helper to set multiple permissions
    const allow = (perms: Permission[]) => perms.forEach(p => permissions[p] = true);

    switch (role) {
        case UserRole.MANAGER:
            // Manager has ALL permissions
            Object.values(Permission).forEach(p => permissions[p] = true);
            break;

        case UserRole.ADMIN:
            allow([
                Permission.VIEW_ALL_EMPLOYEES,
                Permission.MANAGE_ALL_EMPLOYEES, // Except deleting Manager (logic handled in service)
                Permission.VIEW_REPORTS,
                Permission.APPROVE_REQUESTS_INITIAL,
                Permission.MANAGE_WARNINGS,
                Permission.VIEW_ORG_CHART
            ]);
            // Explicitly deny sensitive payroll if needed, though default is false
            break;

        case UserRole.DEPT_MANAGER:
            allow([
                Permission.MANAGE_DEPT_EMPLOYEES,
                Permission.APPROVE_REQUESTS_INITIAL, // For own dept
                Permission.VIEW_ORG_CHART
            ]);
            break;

        case UserRole.EMPLOYEE:
            allow([
                Permission.VIEW_ORG_CHART
            ]);
            break;
    }

    return permissions;
};

// Helper for UI components
export const hasPermission = (userPermissions: Record<string, boolean> | undefined, permission: Permission): boolean => {
    return !!userPermissions?.[permission];
};
