import { SwitchConfig } from "../structs/Module";

class SwitchElem 
{
    static MUL:number = 1 / 9;
    static getValue( config:SwitchConfig ,step:number):boolean 
    {
        const freq:number = config.interval.options.min + (config.interval.options.max - config.interval.options.min) * (config.interval.value * SwitchElem.MUL);
        const threshold:number = config.balance.options.min + (config.balance.options.max - config.balance.options.min) * (config.balance.value * SwitchElem.MUL);
        const startState:boolean = config.start.value;
        let value:boolean = ( ( step / freq ) % 1 ) < threshold ? true : false;

        if(startState)
            value = !value;

        return value;        
    }
}

export { SwitchElem };