import { getAllUsers, updateUserStatus, updateUserRole } from "@/lib/db/user"
import { IUser, UserStatus, UserRole } from "@/models/User"

/**
 * Get all users for admin dashboard (sorted newest first, no passwords).
 */
export async function fetchAllUsers(): Promise<IUser[]> {
    return getAllUsers()
}

/**
 * Approve a pending user → sets status to "active".
 */
export async function approveUser(userId: string): Promise<IUser | null> {
    return updateUserStatus(userId, "active")
}

/**
 * Disable an active user → sets status to "disabled".
 */
export async function disableUser(userId: string): Promise<IUser | null> {
    return updateUserStatus(userId, "disabled")
}

/**
 * Re-enable a disabled user → sets status to "active".
 */
export async function enableUser(userId: string): Promise<IUser | null> {
    return updateUserStatus(userId, "active")
}

/**
 * Promote a user to admin role.
 */
export async function makeAdmin(userId: string): Promise<IUser | null> {
    return updateUserRole(userId, "admin")
}

/**
 * Demote an admin back to regular user.
 */
export async function removeAdmin(userId: string): Promise<IUser | null> {
    return updateUserRole(userId, "user")
}
