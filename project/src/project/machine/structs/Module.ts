import { Collider, RigidBody } from "@dimforge/rapier2d";
import { Object3D, Vector2 } from "three";
import { ModuleVis } from "../ModuleVis";
import { IElement } from "../elements/IElement";

enum ModuleOrientation
{
    Up = 0,
    Right = 1,
    Down = 2,
    Left = 3,
}

enum ModuleType
{
    Empty = "Empty",
    Block = "Weight", 
    Motor = "Motor",
    Rocket = "Rocket",
    Spray = "Particle Spray",
    Party = "Brush",
    Stamp = "Stamp",
    WaveMod = "Wave Mod",
    Rotator = "Rotator Mod",
    Perlin = "Perlin Mod",
    Switch = "Switch",
}

enum WaveShape
{
    Sine = "Sine",
    Square = "Square",
    Triangle = "Triangle",
}

enum ParticleShape
{
    Circle = "Circle",
    Square = "Square",
    Triangle = "Triangle",
    Hexagon = "Hexagon",
    Rectangle = "Rectangle",
    Line = "Line",
}

enum ColorMode
{
    Random = "Random",
    Rotating = "Rotating",
    Palette1 = "Palette 1",
    Palette2 = "Palette 2",
    Palette3 = "Palette 3",
    Palette4 = "Palette 4",
}


class Module
{
    // struct for React
    static moduleTypes = [
        {id: 1, name: ModuleType.Block},
        {id: 2, name: ModuleType.Motor},
        {id: 3, name: ModuleType.Rocket},
        {id: 4, name: ModuleType.Spray},
        {id: 5, name: ModuleType.Party},
        {id: 6, name: ModuleType.Stamp},
        {id: 7, name: ModuleType.WaveMod},
        {id: 8, name: ModuleType.Rotator},
        {id: 9, name: ModuleType.Perlin},
        {id: 10, name: ModuleType.Switch},

    ];
    
    position:Vector2 = new Vector2(); // grid space position
    canRotate:boolean = false;
    orientation:ModuleOrientation = ModuleOrientation.Up;
    _type:ModuleType = ModuleType.Empty;
    vis:ModuleVis;
    visOffset:Vector2 = new Vector2();
    rb:RigidBody;
    collider:Collider;
    element:IElement = null;
    mods:Module[] = [];
    config:ModConfig = null;

    constructor()
    {

    }

    get type():ModuleType
    {
        return this._type;
    }

    set type(t:ModuleType)
    {
        this._type = t;
        this.canRotate = ( t == ModuleType.Motor || t == ModuleType.Party || t == ModuleType.Spray || t == ModuleType.Rocket );
        this.config = this.createConfig();
    }

    createConfig():ModConfig
    {
        switch(this._type)
        {
            case ModuleType.Block:
                return new WeightConfig();
            case ModuleType.Motor:
                return new MotorConfig();
                /*
            case ModuleType.Ribbon:
                return new RibbonConfig();
                */
            case ModuleType.Spray:
                return new ParticlesConfig();
            case ModuleType.Party:
                return new RibbonConfig();
                /*
            case ModuleType.Pen:
                return new RibbonConfig();
                */
            case ModuleType.WaveMod:
                return new WaveConfig();
            case ModuleType.Rotator:
                return new RotatorConfig();
            case ModuleType.Perlin:
                return new PerlinConfig();
            case ModuleType.Switch:
                return new SwitchConfig();
            case ModuleType.Rocket:
                return new RocketConfig();
            case ModuleType.Stamp:
                return new StampConfig();
            default:
                return null;
        }
    }

    prepareForSerialization():Object
    {
        const typeIndex:number = Object.values(ModuleType).indexOf(this.type);
        if( typeIndex == -1)
        {
            throw new Error("Module type not found: " + this.type);
        }

        return {
            o: this.orientation,
            t: Object.values(ModuleType).indexOf(this.type),
            c: this.prepareConfigForSerialization(),
        }
    }

    prepareConfigForSerialization():Object
    {
        const parameters = [];
        for (const key in this.config)
        {
            const p:ConfigParam = this.config[key];

            let valStr:string = "";
            if(p.type == "select")
            {
                if( p.id == "waveShape")
                {
                    valStr = Object.keys(WaveShape).indexOf(p.value as string).toString();
                }
                else if( p.id == "shape")
                {
                    valStr = Object.keys(ParticleShape).indexOf(p.value as string).toString();
                }
                else if( p.id == "color")
                {
                    valStr = Object.values(ColorMode).indexOf(p.value as ColorMode).toString();
                }
            }
            else if( p.type == "number")
            {   
                valStr = (p.value as number).toFixed(0);
            }
            else if( p.type == "boolean")
            {
                valStr = (p.value as boolean) ? "1" : "0";
            }            

            parameters.push( valStr );
        }
        return parameters;
    }

    /**
     * 
     * @param orientation : ModuleOrientation => The orientation of the module
     * @returns : number => The angle of the module in radians
     */
    static orientationToAngle(orientation:ModuleOrientation):number
    {
        switch(orientation)
        {
            case ModuleOrientation.Up:
                return 0;
            case ModuleOrientation.Right:
                return Math.PI/2;
            case ModuleOrientation.Down:
                return Math.PI;
            case ModuleOrientation.Left:
                return Math.PI*3/2;
        }
    }
}

class ConfigParam 
{
    id: string; 
    name: string; 
    desc:string;
    type: "number" | "int" | "boolean" | "color" | "string" | "select";
    default: string | number | bigint | boolean;
    value: string | number | bigint | boolean;
    exposed:boolean = true;
    options:Object;

}

class FloatConfigParam extends ConfigParam
{
    id:string;
    name:string;
    desc:string;
    type: "number" = "number";
    default: number;
    value: number;
    exposed:boolean = true;
    options: {
        min:number,
        max:number,
    }

    static Randomize(param:FloatConfigParam)
    {
        
        param.value = Math.floor(Math.random() * 10);
    }

}

class IntConfigParam extends ConfigParam
{
    id:string;
    name:string;
    desc:string;
    type: "int" = "int";
    default: number;
    value: number;
    exposed:boolean = true;
    options: {
        min:number,
        max:number,
    }

    static Randomize(param:IntConfigParam)
    {
        param.value = Math.floor(Math.random() * 10);
    }

}

class BoolConfigParam extends ConfigParam
{
    id:string;
    name:string;
    desc:string;
    type: "boolean" = "boolean";
    default: boolean;
    value: boolean;
    exposed:boolean = true;
    options: {}

    static Randomize(param:BoolConfigParam)
    {
        param.value = (Math.random() > .5);
    }

}

class SelectConfigParam extends ConfigParam
{
    id:string;
    name:string;
    desc:string;
    type: "select" = "select";
    default: string;
    value: string;
    exposed:boolean = true;
    options: {name:string, value:any}[]

    static Randomize(param:SelectConfigParam)
    {
        const index:number = Math.floor(Math.random() * param.options.length);
        param.value = param.options[index].value;
    }

}





class ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:true, options: {min: 0, max: 5}};
}

class WeightConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 2, value: 2, exposed:true, options: {min: 0, max: 5}};
}

class MotorConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    power:FloatConfigParam = { id: "power", name: "Power",desc: "How powerful the motor is",  type: "number", default: 4, value: 4, exposed:true, options: {min: 1, max: 10}};
    powerNoise:FloatConfigParam = { id: "powerNoise", name: "Power noise", desc: "Noise applied to the motor", type: "number", default: 1, value: 1, exposed:true,  options: {min: 0, max: 1}};
    directionNoise:FloatConfigParam = { id: "directionNoise", name: "Direction noise", desc: "Noise applied to the direction the motor is going", type: "number", default: 1, value: 1, exposed:true, options: {min: 0, max: 1}};
}

class RibbonConfig extends ModConfig
{
    color:SelectConfigParam = {id:"color", name:"Color", desc:"The color of the ribbon", type:"select", default: ColorMode.Random, value: ColorMode.Random, exposed:true, options: [
        {name:"Random", value:ColorMode.Random},
        {name:"Rotating", value:ColorMode.Rotating},
        {name:"Palette 1", value:ColorMode.Palette1},
        {name:"Palette 2", value:ColorMode.Palette2},
        {name:"Palette 3", value:ColorMode.Palette3},
        {name:"Palette 4", value:ColorMode.Palette4},
    ]};
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    power:FloatConfigParam = { id: "power", name: "Power", desc: "How far the ribbon is launched", type: "number", default: 0, value: 0, exposed:true, options: {min: 0, max: 100}};
    powerNoise:FloatConfigParam = { id: "powerNoise", name: "Power noise", desc: "Noise in how far the ribbon is launched", type: "number", default: 0, value: 0, exposed:true,  options: {min: 0, max: 1}};
    directionNoise:FloatConfigParam = { id: "directionNoise", name: "Direction Noise", desc: "Noise is the launch direction", type: "number", default: 0, value: 0, exposed:true, options: {min: 0, max: 1}};
    width:FloatConfigParam = { id: "width", name: "Width", desc: "Width of the ribbon", type: "number", default: 2, value: 2, exposed:true, options: {min: 0.1, max: 5}};
    widthNoise:FloatConfigParam = { id: "widthNoise", name: "Width Noise", desc: "Noise applied the width of the ribbon", type: "number", default: 0, value: 0, exposed:true, options: {min: 0, max: 1}};
    enableCollision:BoolConfigParam = { id: "enableCollision", name: "Collide with borders", desc: "Enables collision with borders. Otherwise it wraps", type: "boolean", default: false, value: false, exposed:true, options: {}};
}

class ParticlesConfig extends ModConfig
{
    color:SelectConfigParam = {id:"color", name:"Color", desc:"The color of the particles", type:"select", default: ColorMode.Random, value: ColorMode.Random, exposed:true, options: [
        {name:"Random", value:ColorMode.Random},
        {name:"Rotating", value:ColorMode.Rotating},
        {name:"Palette 1", value:ColorMode.Palette1},
        {name:"Palette 2", value:ColorMode.Palette2},
        {name:"Palette 3", value:ColorMode.Palette3},
        {name:"Palette 4", value:ColorMode.Palette4},
    ]};
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    power:FloatConfigParam = { id: "power", name: "Power", desc: "How far are the particles launched", type: "number", default: 4, value: 4, exposed:true, options: {min: 0, max: 100}};
    powerNoise:FloatConfigParam = { id: "powerNoise", name: "Power noise", desc: "Noise applied to the value above", type: "number", default: 0, value: 0, exposed:true,  options: {min: 0, max: 1}};
    directionNoise:FloatConfigParam = { id: "directionNoise", name: "Direction noise", desc: "Noise applied to the launch direction",  type: "number", default: 0, value: 0, exposed:true, options: {min: 0, max: 1}};
    size:FloatConfigParam = { id: "size", name: "Size", desc: "Size of the particles", type: "number", default: 5, value: 5, exposed:true, options: {min: 1, max: 6}};
    shape:SelectConfigParam = { id: "shape", name: "Shape", desc: "Shape of the particles", type: "select", default: ParticleShape.Circle, value: ParticleShape.Circle, exposed:true, options: [
        {name:"Circle", value:ParticleShape.Circle},
        {name:"Square", value:ParticleShape.Square},
        {name:"Triangle", value:ParticleShape.Triangle},
        {name:"Hexagon", value:ParticleShape.Hexagon},
        {name:"Rectangle", value:ParticleShape.Rectangle},
        {name:"Line", value:ParticleShape.Line},
    ]};
    enableCollision:BoolConfigParam = { id: "enableCollision", name: "Collides with borders", desc: "Otherwise wraps", type: "boolean", default: false, value: false, exposed:true, options: {}};
    selfCollide:BoolConfigParam = { id: "selfCollide", name: "Collides with other particles", desc: "", type: "boolean", default: false, value: false, exposed:true, options: {}};
}

class WaveConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    frequency:FloatConfigParam = { id: "frequency", name: "Wave length", desc: "How long are the waves", type: "number", default: 3, value: 3, exposed:true, options: {min: 10, max: 200}};
    amplitude:FloatConfigParam = { id: "amplitude", name: "Amplitude", desc: "How tall are the waves", type: "number", default: 3, value: 3, exposed:true, options: {min: 0, max: 1}};
    phase:FloatConfigParam = { id: "phase", name: "Phase", desc: "Timing offset",  type: "number", default: 0, value: 0, exposed:true,  options: {min: 0, max: 1}};
    waveshape:SelectConfigParam = { id: "waveshape", name: "Wave shape", desc: "The shape of the waves", type: "select", default: WaveShape.Sine, value: WaveShape.Sine, exposed:true, options:[
        {name:"Sine", value:WaveShape.Sine},
        {name:"Square", value:WaveShape.Square},
        {name:"Triangle", value:WaveShape.Triangle},
    ]};
}

class RotatorConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    interval:FloatConfigParam = { id: "frequency", name: "Interval",desc: "Time between rotations", type: "number", default: 3, value: 3, exposed:true, options: {min: 10, max: 200}};
    angle:BoolConfigParam = { id: "angle", name: "Rotate by 90° / 180°", desc: "", type: "boolean", default: false, value: false, exposed:true, options: {}};
    clockwise:BoolConfigParam = { id: "clockWise", name: "Clockwise",desc: "The rotations direction",  type: "boolean", default: false, value: false, exposed:true, options: {}};
}

class PerlinConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    frequency:FloatConfigParam = { id: "frequency", name: "Frequency", desc: "Controls the scale of the noise", type: "number", default: 3, value: 3, exposed:true, options: {min: 0.001, max: 0.005}};
    amplitude:FloatConfigParam = { id: "amplitude", name: "Amplitude", desc: "Modifies the strength of the effect", type: "number", default: 1, value: 1, exposed:true, options: {min: 0.01, max: 1}};
    octaves:FloatConfigParam = { id: "octaves", name: "Octaves", desc: "How many layers of noise", type: "number", default: 3, value: 3, exposed:true, options: {min: 1, max: 5}};
}

class SwitchConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    interval:FloatConfigParam = { id: "frequency", name: "Interval",desc: "Time between rotations", type: "number", default: 3, value: 3, exposed:true, options: {min: 10, max: 200}};
    start:BoolConfigParam = { id: "start", name: "Starts off/on",desc: "Initial state",  type: "boolean", default: false, value: false, exposed:true, options: {}};
    combineRule:BoolConfigParam = { id: "combineRule", name: "Combine AND / OR",desc: "How this combines with other switches",  type: "boolean", default: false, value: false, exposed:true, options: {}};
}

class RocketConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    power:FloatConfigParam = { id: "power", name: "Power",desc: "How powerful the rocket is",  type: "number", default: 4, value: 4, exposed:true, options: {min: 1, max: 20}};
    delay:FloatConfigParam = { id: "delay", name: "Start delay", desc: "When will the rocket start", type: "number", default: 1, value: 1, exposed:true,  options: {min: 0, max: 80}};
    burn:FloatConfigParam = { id: "burn", name: "Burn duration", desc: "How long will it burn", type: "number", default: 1, value: 1, exposed:true, options: {min: 5, max: 40}};
    powerNoise:FloatConfigParam = { id: "powerNoise", name: "Power noise", desc: "Noise applied to the power", type: "number", default: 1, value: 1, exposed:true,  options: {min: 0, max: 1}};
    directionNoise:FloatConfigParam = { id: "directionNoise", name: "Direction noise", desc: "Noise applied to the direction the rocket is going", type: "number", default: 1, value: 1, exposed:true, options: {min: 0, max: 1}};
}

class StampConfig extends ModConfig
{
    mass:FloatConfigParam = { id: "mass", name: "Mass", desc: "The mass of the block", type: "number", default: 1, value: 1, exposed:false, options: {min: 0, max: 5}};
    color:SelectConfigParam = {id:"color", name:"Color", desc:"The color of the ribbon", type:"select", default: ColorMode.Random, value: ColorMode.Random, exposed:true, options: [
        {name:"Random", value:ColorMode.Random},
        {name:"Rotating", value:ColorMode.Rotating},
        {name:"Palette 1", value:ColorMode.Palette1},
        {name:"Palette 2", value:ColorMode.Palette2},
        {name:"Palette 3", value:ColorMode.Palette3},
        {name:"Palette 4", value:ColorMode.Palette4},
    ]};
    size:FloatConfigParam = { id: "size", name: "Size", desc: "Size of the stamp", type: "number", default: 5, value: 5, exposed:true, options: {min: 5, max: 20}};
    pressure:FloatConfigParam = { id: "pressure", name: "Pressure", desc: "How much pressure is applied", type: "number", default: 1, value: 1, exposed:true, options: {min: .05, max: 0.5}};
}

export {Module, ModuleType, ModuleOrientation, WaveShape, ParticleShape, ColorMode};
export {ConfigParam, FloatConfigParam, IntConfigParam, BoolConfigParam, SelectConfigParam};
export {ModConfig, WeightConfig, MotorConfig, RibbonConfig, ParticlesConfig, WaveConfig, RotatorConfig, PerlinConfig, SwitchConfig, RocketConfig, StampConfig };