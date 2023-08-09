import { Object3D, Vector2, Vector3 } from "three";
import { IElement } from "./IElement";
import { World } from "@dimforge/rapier2d";
import { Module, ModuleType, WaveConfig, WeightConfig } from "../structs/Module";
import { Rand } from "../../../helpers/Rand";
import { Execute } from "../Execute";

class Weight extends Object3D implements IElement
{
    module: Module;
    world:World;
    stepCounter:number = 0;

    constructor(m:Module, w:World)
    {
        super();
        
        
        this.module = m;
        this.world = w;
        /*
        const massValue:number = m.config.mass.options.min +  m.config.mass.value*.1 * (m.config.mass.options.max - m.config.mass.options.min);
        this.module.collider.setMass(massValue);
        */
    }
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean = false;


    update(dt: number, elapsed: number)
    {
        /*
        const config:WeightConfig = this.module.config as WeightConfig;
        const baseMass:number = config.mass;
        let modMass:number = 0 ;
        for( let i:number = 0 ;i< this.module.mods.length; i++)
        {
            const mod:Module = this.module.mods[i];
            
            if(mod.type == ModuleType.WaveMod)
            {
                const mc:WaveConfig = mod.config as WaveConfig;
                modMass += Math.sin((mc.phase + this.stepCounter/mc.frequency) * Math.PI * 2)*mc.amplitude;
            }
        }
        */
        this.stepCounter++;        
    }
    dispose()
    {

    }
}

export { Weight };