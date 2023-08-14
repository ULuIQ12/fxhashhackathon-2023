import { Group } from "three";
import { IElement } from "./IElement";
import { ModConfig, Module, RotatorConfig } from "../structs/Module";

class Rotator extends Group implements IElement
{
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean  =false;
    static geModuleRotation( m:Module, rotConfig:RotatorConfig, step:number = 0):number
    {
        const angle:number = (rotConfig.angle.value)?Math.PI:Math.PI*.5;
        const interval:number = rotConfig.interval.options.min +  rotConfig.interval.value*1/9 * (rotConfig.interval.options.max - rotConfig.interval.options.min);
        const addRot:number = Math.floor( step/interval ) * ((rotConfig.clockwise.value)?1:-1) * angle;
        return addRot;
    }

    module: Module;

    update(dt: number, elapsed: number)
    {

    }
    dispose()
    {
            
    }
}

export { Rotator };