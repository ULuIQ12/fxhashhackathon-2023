import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Build } from '../machine/Build';
import { ModuleVis } from '../machine/ModuleVis';
import { Box, Fade, ListItemIcon, ListItemText, MenuList, Modal, Paper } from '@mui/material';
import { ContentCopy, Delete, DragHandle, Edit, PanTool, Rotate90DegreesCcw, Rotate90DegreesCw, Settings, Sync, Translate } from '@mui/icons-material';
import { Module } from '../machine/structs/Module';
import EditWave from './EditModule';


let openModuleMenu = (position, data) => {}
let isModuleMenuOpen = ():boolean => {return false}

/**
 * The menu that appears when you click on a module.
 * @returns 
 */

export default function ModuleMenu() {

    //const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [anchorPosition, setAnchorPosition] = React.useState<null | { top: number; left: number }>({top:0,left:0});
    const [data, setData] = React.useState({});
    const [open,setOpen] = React.useState(false);
    const [canRotate, setCanRotate] = React.useState(false);

    const lastOpen = React.useRef(0);
    

    openModuleMenu = (position, data) => {
        setData(data);
        setCanRotate(data.canRotate);

        //console.log( "openModuleMenu at ", position);
        setAnchorPosition( {top:position.top, left:position.left + 5});
        openMenu();
    }

    isModuleMenuOpen = ():boolean => {
        return open;
    }

    
    
    //const open = Boolean(true);
    
    const closeMenu = () => {

        if( performance.now() - lastOpen.current < 30 ) // little hack for touch
            return ;
        
        setData(null);
        setOpen(false);
    }

    const openMenu = () => {
        
        lastOpen.current = performance.now();
        setOpen(true);
    }

    const clickEdit = () => {
        Build.MenuEditModule(data as Module);
        closeMenu();
    }

    const clickMove = () => {
        Build.MenuMoveModule(data as Module);
        closeMenu();
    }

    const clickOpenOrientationMenu = () => {
        Build.MenuOrientModuule(data as Module);
        closeMenu();
    }

    const rotateLeft = () => {
        Build.MenuRotateModule(data as Module, 1);
        closeMenu();
    }

    const rotateRight = () => {
        Build.MenuRotateModule(data as Module, -1);
        closeMenu();
    }

    const clickDestroy = () => {
        Build.DestroyModule(data as Module);
        closeMenu();
    }

    const clickDuplicate = () => {
        Build.DuplicateModule(data as Module);
        closeMenu();
    }

    return (
    <Paper>
        

        <Menu
        id="basic-menu"
        sx={{
            textAlign:'left',
        }}
        open={open}
        onClose={closeMenu}
        anchorReference='anchorPosition'
        anchorPosition={anchorPosition}
        transitionDuration={{enter: 250, exit: 100}}
        MenuListProps={{
            'aria-labelledby': 'basic-button',
        }}
        
        PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 20px 0px rgba(0,0,0,0.25)', 
                m:0,
                overflow:'hidden',
            }}}
        >
            <MenuList sx={{
                mt:-2,
                mb:-2,
                overflow:'hidden',

            }}>
                <MenuItem divider={true} onClick={clickEdit}><ListItemIcon sx={{pr:2}}><Settings  color='primary' /></ListItemIcon><ListItemText>Configure</ListItemText></MenuItem>
                <MenuItem divider={true} onClick={clickMove}><ListItemIcon sx={{pr:2}}><PanTool  color='primary' /></ListItemIcon><ListItemText>Move</ListItemText></MenuItem>
                {canRotate && <MenuItem divider={true} onClick={clickOpenOrientationMenu}><ListItemIcon sx={{pr:2}}><Sync  color='primary' /></ListItemIcon><ListItemText>Set orientation</ListItemText></MenuItem>}
                <MenuItem divider={true} onClick={clickDuplicate}><ListItemIcon sx={{pr:2}}><ContentCopy  color='primary' /></ListItemIcon><ListItemText>Duplicate</ListItemText></MenuItem>
                <MenuItem onClick={clickDestroy}><ListItemIcon sx={{pr:2}}><Delete color='primary' /></ListItemIcon><ListItemText>Delete</ListItemText></MenuItem>
            </MenuList> 
        </Menu>
        
    </Paper>
    );
}

export {openModuleMenu, isModuleMenuOpen};