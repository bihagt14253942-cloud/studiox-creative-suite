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
export interface Project {
    id: string;
    stateJson: string;
    owner: Principal;
    name: string;
    createdAt: Time;
    updatedAt: Time;
    assetIds: Array<string>;
}
export interface AssetMetadata {
    id: string;
    name: string;
    size: bigint;
    projectId: string;
    blobId: string;
    assetType: AssetType;
}
export enum AssetType {
    audio = "audio",
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAsset(metadata: AssetMetadata): Promise<void>;
    createAssets(metadataArray: Array<AssetMetadata>): Promise<void>;
    createProject(id: string, name: string, stateJson: string): Promise<void>;
    deleteAsset(id: string): Promise<void>;
    deleteProject(id: string): Promise<void>;
    getAssetMetadata(id: string): Promise<AssetMetadata | null>;
    getAssetsByProject(projectId: string): Promise<Array<AssetMetadata>>;
    getCallerUserRole(): Promise<UserRole>;
    getProject(id: string): Promise<Project | null>;
    getProjectsByOwner(owner: Principal): Promise<Array<Project>>;
    isCallerAdmin(): Promise<boolean>;
    listAllProjects(): Promise<Array<Project>>;
    reindex(): Promise<void>;
    updateAsset(metadata: AssetMetadata): Promise<void>;
    updateProject(id: string, project: Project): Promise<void>;
}
