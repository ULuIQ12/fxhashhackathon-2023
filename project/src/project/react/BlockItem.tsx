import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Container, Tooltip } from '@mui/material';
import { Build } from '../machine/Build';
import { ModuleType } from '../machine/structs/Module';
import { Assets } from '../../helpers/Assets';

/**
 * Block button, handles click and drag
 * @param param0 
 * @returns 
 */
export default function BlockItem({data, dragStartCallback}) {


    const tooltips = {};
    tooltips[ModuleType.Block] = "Weight : adds weight to your machine";
    tooltips[ModuleType.Motor] = "Motor : makes your machine move";
    tooltips[ModuleType.Spray] = "Spray : sends colored particles around";
    tooltips[ModuleType.Party] = "Brush : draws / throws a line of paint";
    tooltips[ModuleType.WaveMod] = "Wave Modulator : apply a wave effect to neighbouring blocks";    
    tooltips[ModuleType.Rotator] = "Rotator : periodically rotates the neighbouring blocks";
    tooltips[ModuleType.Perlin] = "Perlin : modify the behaviour of neighbours based on a 2d perlin noise";
    tooltips[ModuleType.Switch] = "Switch : activates/Deactivates the neighbouring blocks";
    tooltips[ModuleType.Rocket] = "Rocket : a one time power burst";
    tooltips[ModuleType.Stamp] = "Stamp : a tooltip for the stamp";
    

    

    function handleDragStart(event)
    {
        event.preventDefault();
        dragStartCallback();
        Build.AddBlock(data, event);
    }

    function handleClickStart(event)
    {
        event.preventDefault();
        dragStartCallback();
        Build.AddBlock(data, event, true);
    }

    function handleTouchStart(event)
    {
      dragStartCallback();
      console.log( "touch start: ", event );
      Build.AddBlock(data, event, false);
    }

    function handleTouchEnd(event)
    {
      
      console.log( "touch end: ", event );
      //Build.AddBlock(data, event, true);
    }

    function getBoxStyle()
    {
        const mtype:string = data.name;
        //console.log( "mtype = " , mtype, data );
        let icon_url:string = "";
        switch( mtype )
        {
            case ModuleType.Motor:
              icon_url = Assets.MOTOR_ICON;
              break;
            case ModuleType.WaveMod:
              icon_url = Assets.WAVE_ICON;
              break;
            case ModuleType.Block:
              icon_url = Assets.WEIGHT_ICON;
              break;
            case ModuleType.Rotator:
              icon_url = Assets.ROTATOR_ICON;
              break;
            case ModuleType.Spray:
              icon_url = Assets.SPRAY_ICON;
              break;
            case ModuleType.Party:
              icon_url = Assets.BRUSH_ICON;
              break;
            case ModuleType.Perlin:
              icon_url = Assets.PERLIN_ICON;
              break;
            case ModuleType.Switch:
              icon_url = Assets.SWITCH_ICON;
              break;
            case ModuleType.Rocket:
              icon_url = Assets.ROCKET_ICON;
              break;
            case ModuleType.Stamp:
              icon_url = Assets.STAMP_ICON;
              break;
            default:
              icon_url = Assets.WEIGHT_ICON;
              break;

        }
        return {
            
            backgroundImage: `url(${icon_url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '80px',
            height: '80px',

        }

    }




  return (
    <Box
    sx={{
      boxShadow: '0px 0px 0px 3px rgba(255,255,255,.2)',
      borderRadius: '10px',
      width: 'fit-content',
      height: 'fit-content',
      blockSize: 'fit-content',
    }}
    >
        <Tooltip title={tooltips[data.name]} placement="top" arrow>            
            <Button sx={getBoxStyle} 
              onClick={handleClickStart} 
              onDragStart={handleDragStart} 
              onTouchStart={handleTouchStart} 
              onTouchEnd={handleTouchEnd}
              draggable
            />
        </Tooltip>
    </Box>
    
  );

}