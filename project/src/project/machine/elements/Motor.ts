import { Object3D, Vector2, Vector3 } from "three";
import { IElement } from "./IElement";
import { World } from "@dimforge/rapier2d";
import { Module, ModuleType, MotorConfig, PerlinConfig, RotatorConfig, SwitchConfig, WaveConfig, WaveShape } from "../structs/Module";
import { Rand } from "../../../helpers/Rand";
import { Execute } from "../Execute";
import { Rotator } from "./Rotator";
import { PerlinMod } from "./PerlinMod";
import { WaveMod } from "./WaveMod";
import { SwitchElem } from "./SwitchElem";

class Motor extends Object3D implements IElement
{
    module: Module;
    world:World;
    stepCounter:number = 0;
    TAU:number = Math.PI * 2;
    MUL:number = 1 / 9;
    constructor(m:Module, w:World)
    {
        super();
        this.module = m;
        this.world = w;
        
    }
    getProgress(): number {
        return 0;
    }
    isDrawingElement:boolean = false;


    update(dt: number, elapsed: number): void {
        
        const rb = this.module.rb;
        if(rb == null)
            return;
        
        const config:MotorConfig = this.module.config as MotorConfig;

        let modForce:number = 0;
        let modAngle:number = 0;
        let isOn:boolean = true;
        for( let i:number = 0 ;i< this.module.mods.length; i++)
        {
            const mod:Module = this.module.mods[i];
            if(mod.type == ModuleType.WaveMod)
            {
                const mc:WaveConfig = mod.config as WaveConfig;
                modForce += ( WaveMod.getWave(mc, this.stepCounter)*2-1) * config.power.value;
            }
            else if( mod.type == ModuleType.Rotator)
            {
                modAngle += Rotator.geModuleRotation(this.module, mod.config as RotatorConfig, this.stepCounter);
            }
            else if( mod.type == ModuleType.Perlin)
            {
                const config:PerlinConfig = mod.config as PerlinConfig;
                const pmod:PerlinMod = mod.element as PerlinMod;
                const value:number = pmod.samplePosition( rb.translation().x, rb.translation().y);
                modAngle += value * Math.PI * .1;   
            }
            else if( mod.type == ModuleType.Switch)
            {
                const config:SwitchConfig = mod.config as SwitchConfig;
                if( !config.combineRule.value ) 
                    isOn = (isOn && SwitchElem.getValue( config, this.stepCounter));
                else 
                    isOn = (isOn || SwitchElem.getValue( config, this.stepCounter));
            }
        }

        this.module.vis.additionalRotation = modAngle;

        if( isOn ) 
        {
            const pnoise:number = config.powerNoise.options.min +  config.powerNoise.value*this.MUL * (config.powerNoise.options.max - config.powerNoise.options.min);
            const mPower:number = config.power.options.min +  config.power.value*this.MUL * (config.power.options.max - config.power.options.min);
            const dirNoise:number = config.directionNoise.options.min +  config.directionNoise.value*this.MUL * (config.directionNoise.options.max - config.directionNoise.options.min);
            const powerNoise:number = Rand.fBetween(-pnoise,pnoise) * mPower;
            const noiseAngleMax:number = dirNoise * Math.PI /2;
            const directionNoise:number = Rand.fBetween(-noiseAngleMax, noiseAngleMax);
            const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation() + directionNoise + modAngle;
            const baseForce:number = mPower;        
            const totalForce:number = baseForce + powerNoise + modForce;
            const force:Vector2 = new Vector2(Math.sin(angle), Math.cos(angle)).multiplyScalar(totalForce);
            const roffset:Vector2 = this.module.visOffset.clone().rotateAround(new Vector2(0,0), rb.rotation());
            const dx:number = rb.worldCom().x + roffset.x;
            const dy:number = rb.worldCom().y + roffset.y;
        
            if( !Execute.instance.useSingleRb)
                rb.applyImpulse({x:-force.x, y:force.y}, true)
            else 
                rb.applyImpulseAtPoint( {x:-force.x, y:force.y}, {x:dx, y:dy}, true)
        }
            
        this.stepCounter++;
    }
    dispose()
    {

    }
}

export { Motor };