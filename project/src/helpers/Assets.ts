import { ModuleType } from "../project/machine/structs/Module";
import { Texture, TextureLoader } from "three";

class Assets 
{
    static BRUSH_ICON = "./assets/icons/icon_brush.png";
    static MOTOR_ICON = "./assets/icons/icon_motor.png";
    static WEIGHT_ICON = "./assets/icons/icon_weight.png";
    static WAVE_ICON = "./assets/icons/icon_wave.png";
    static SPRAY_ICON = "./assets/icons/icon_spray.png";
    static ROTATOR_ICON = "./assets/icons/icon_rotator.png";
    static PERLIN_ICON = "./assets/icons/icon_perlin.png";
    static SWITCH_ICON = "./assets/icons/icon_switch.png";
    static ROCKET_ICON = "./assets/icons/icon_rocket.png";
    static STAMP_ICON = "./assets/icons/icon_stamp.png";



    static LoadedIcons:Object = {};

    static GetModuleIconTexture(type:ModuleType, callback:Function = null):Texture
    {
        if( Assets.LoadedIcons[type] != undefined)
        {
            return Assets.LoadedIcons[type];
        }

        //console.log("Loading icon for", type);

        let url:string = "";
        switch(type)
        {
            case ModuleType.Party:
                url = Assets.BRUSH_ICON;
                break;
            case ModuleType.Motor:
                url = Assets.MOTOR_ICON;
                break;
            case ModuleType.Rocket:
                url = Assets.ROCKET_ICON;
                break;
            default:
            case ModuleType.Block:
                url = Assets.WEIGHT_ICON;
                break;
            case ModuleType.WaveMod:
                url = Assets.WAVE_ICON;
                break;
            case ModuleType.Spray:
                url = Assets.SPRAY_ICON;
                break;
            case ModuleType.Rotator:
                url = Assets.ROTATOR_ICON;
                break;
            case ModuleType.Perlin:
                url = Assets.PERLIN_ICON;
                break; 
            case ModuleType.Switch:
                url = Assets.SWITCH_ICON;
                break; 
            case ModuleType.Stamp:
                url = Assets.STAMP_ICON;
                break; 
                 
        }

        const texture:Texture = new TextureLoader().load(url, (texture:Texture) => {callback(texture)});
        
        Assets.LoadedIcons[type] = texture;

    }

}

export {Assets}