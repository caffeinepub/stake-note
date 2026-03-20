import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type EntryId = bigint;
export interface DiaryEntry {
    id: EntryId;
    title: string;
    body: string;
    createdAt: Time;
    updatedAt: Time;
    moodTags: Array<string>;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(title: string, body: string, moodTags: Array<string>): Promise<EntryId>;
    deleteEntry(entryId: EntryId): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntriesByPage(page: bigint, pageSize: bigint): Promise<Array<DiaryEntry>>;
    getEntry(entryId: EntryId): Promise<DiaryEntry | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchEntries(keyword: string): Promise<Array<DiaryEntry>>;
    updateEntry(entryId: EntryId, title: string, body: string, moodTags: Array<string>): Promise<void>;
}
