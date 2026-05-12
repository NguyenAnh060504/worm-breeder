import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BodyPart {
    element: Element;
    mutation: MutationVariant;
}
export type WormId = bigint;
export interface Worm {
    id: WormId;
    element: Element;
    body: BodyPart;
    head: BodyPart;
    tail: BodyPart;
}
export interface NewWorm {
    element: Element;
    body: BodyPart;
    head: BodyPart;
    tail: BodyPart;
}
export enum Element {
    Grass = "Grass",
    Water = "Water",
    Electric = "Electric",
    Earth = "Earth"
}
export enum MutationVariant {
    Gradient = "Gradient",
    Solid = "Solid",
    Metallic = "Metallic",
    Spotted = "Spotted",
    Striped = "Striped"
}
export interface backendInterface {
    addWorm(newWorm: NewWorm): Promise<{
        __kind__: "ok";
        ok: WormId;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteWorm(id: WormId): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getWorms(): Promise<Array<Worm>>;
}
