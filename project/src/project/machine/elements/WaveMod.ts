import { WaveConfig, WaveShape } from "../structs/Module";

export class WaveMod 
{
    static MUL:number = 1 / 9;

    static getWave( config:WaveConfig,step:number):number 
    {        
        const amp:number = config.amplitude.options.min + (config.amplitude.options.max - config.amplitude.options.min) * (config.amplitude.value * WaveMod.MUL);
        const freq:number = config.frequency.options.min + (config.frequency.options.max - config.frequency.options.min) * (config.frequency.value * WaveMod.MUL);
        const phase:number = config.phase.options.min + (config.phase.options.max - config.phase.options.min) * (config.phase.value * WaveMod.MUL);
        const shape:string = config.waveshape.value;
        switch (shape)
        {
            case WaveShape.Sine:
                return ( amp * ( Math.sin( (step/freq + phase) * Math.PI * 2 ) + 1 ) * .5 );
            case WaveShape.Square:
                return amp * ( ( (step/freq + phase ) % 1 ) < .5 ? 1 : 0 );
            case WaveShape.Triangle:
                const t:number = (step/freq + phase ) % 1;
                return amp * ( (t < .5) ? t*2 : (1-t)*2 );
                
        }
        return 1;
    }
}