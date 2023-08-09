import { Group } from 'three'
import { IElement } from "./IElement";
import { Module, PerlinConfig } from '../structs/Module';
import FastSimplexNoise from '@webvoxel/fast-simplex-noise';
import { Rand } from '../../../helpers/Rand';

class PerlinMod extends Group implements IElement
{
    module: Module;
    isDrawingElement: boolean  =false;
    noise:FastSimplexNoise;

    constructor(m:Module)
    {
        super();

        this.module = m;
        this.createNoise();
    }

    createNoise()
    {
        const config:PerlinConfig = this.module.config as PerlinConfig;
        const freq:number = config.frequency.options.min +  config.frequency.value * (config.frequency.options.max - config.frequency.options.min);
        const amp:number = config.amplitude.options.min +  config.amplitude.value * (config.amplitude.options.max - config.amplitude.options.min);
        const oct:number = Math.floor( config.octaves.options.min +  config.octaves.value * (config.octaves.options.max - config.octaves.options.min) );
        this.noise = new FastSimplexNoise({
            min:-1 * amp,
            max:1 * amp,
            octaves: oct,
            frequency: freq,
            random:Rand.rand
        });


    }



    samplePosition(px:number, py:number ):number
    {
        const val:number = this.noise.scaled2D(px, py);
        return val;   
    }
    
    update(dt: number, elapsed: number)
    {
        
    }
    dispose() 
    {
        if( this.noise != null)
            this.noise = null;
    };
    
    getProgress(): number {
        return 0;
    }
}

export { PerlinMod }