import { Module } from "../structs/Module";
import { Object3D } from "three";

interface IElement extends Object3D {
    update(dt: number, elapsed: number): void;
    dispose: () => void;
    module:Module;
    getProgress(): number;
    isDrawingElement:boolean;
}

export { IElement };