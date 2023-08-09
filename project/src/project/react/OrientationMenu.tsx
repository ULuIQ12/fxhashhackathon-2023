import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Build } from '../machine/Build';
import { ModuleVis } from '../machine/ModuleVis';
import { Box, Fab, Zoom } from '@mui/material';
import { ArrowDownward, ArrowDropDown, ArrowDropUp, ArrowLeft, ArrowRight, ArrowRightAlt, ArrowUpward, Delete, DragHandle, East, Edit, North, PanTool, Rotate90DegreesCcw, Rotate90DegreesCw, South, Translate, West } from '@mui/icons-material';
import { Module, ModuleOrientation } from '../machine/structs/Module';
import EditWave from './EditModule';


let openOrientationMenu = (position, data) => {}
let isOrientationMenuOpen = ():boolean => {return false}
let closeOrientationMenu = () => {}

export {openOrientationMenu, isOrientationMenuOpen, closeOrientationMenu};

/**
 * Menu to select the orientation of a module. Appears when clicking "Set rotation" in the module menu.
 * @returns 
 */
export default function OrientationMenu() {

    //const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [anchorPosition, setAnchorPosition] = React.useState<null | { top: number; left: number }>({top:0,left:0});
    const [data, setData] = React.useState({});
    const [open,setOpen] = React.useState(false);

    

    openOrientationMenu = (position, data) => {
        setData(data);
        console.log( "openOrientationMenu at ", position);
        setAnchorPosition(position);
        openMenu();
    }

    isOrientationMenuOpen = ():boolean => {
        return open;
    }

    closeOrientationMenu = () => {

        console.log( "closeOrientationMenu")

        //setData(null);
        setOpen(false);
    }

    const menuStyle = {
        position: 'fixed',
        top: anchorPosition.top,
        left: anchorPosition.left,
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        pointerEvents: 'all',

    };

    const nfabStyle =  {
        position: 'fixed',
        top:"0px",
        left:"73px",
    }

    const sfabStyle =  {
        position: 'fixed',
        bottom:"0px",
        left:"73px",
    }

    const efabStyle =  {
        position: 'fixed',
        top:"73px",
        right:"0px",
    }

    const wfabStyle =  {
        position: 'fixed',
        top:"73px",
        left:"0px",
    }
    
    //const open = Boolean(true);
    
    const closeMenu = () => {
        setData(null);
        setOpen(false);
    }

    const openMenu = () => {
        setOpen(true);
    }

    const setOrientationNorth = (event) => {
        
        Build.SetModuleOrientation(data as Module, ModuleOrientation.Up);
        setOpen(false);
    }

    const setOrientationSouth = (event) => {
        Build.SetModuleOrientation(data as Module, ModuleOrientation.Down);
        setOpen(false);
    }

    const setOrientationEast = (event) => {
        Build.SetModuleOrientation(data as Module, ModuleOrientation.Left);
        setOpen(false);
    }

    const setOrientationWest = (event) => {
        Build.SetModuleOrientation(data as Module, ModuleOrientation.Right);
        setOpen(false);
    }


    return (
    <div>
        

        <Menu
        id="orientation-menu"
        sx={menuStyle}
        open={open}
        onClose={closeMenu}
        transitionDuration={{enter: 0, exit: 0}}
        anchorReference='anchorPosition'
        anchorPosition={anchorPosition}
        TransitionComponent={Zoom}
        
        
        >
            <Zoom
                in={open}
                style={{
                    transitionDelay: '0ms',
                }}
            >
            <Fab sx={nfabStyle} color="primary" aria-label="north" onClick={setOrientationNorth}>
                <North />
            </Fab>
            </Zoom>
            <Zoom
                in={open}
                style={{
                    transitionDelay: '100ms',
                }}
            >
            <Fab sx={sfabStyle} color="primary" aria-label="south" onClick={setOrientationSouth}>
                <South />
            </Fab>
            </Zoom>
            <Zoom
                in={open}
                style={{
                    transitionDelay: '50ms',
                }}
            >
            <Fab sx={efabStyle} color="primary" aria-label="east" onClick={setOrientationEast}>
                <East />
            </Fab>
            </Zoom>
            <Zoom
                in={open}
                style={{
                    transitionDelay: '150ms',
                }}
            >
            <Fab sx={wfabStyle} color="primary" aria-label="west" onClick={setOrientationWest}>
                <West />
            </Fab>
            </Zoom>
        </Menu>
        
    </div>
    );
}

