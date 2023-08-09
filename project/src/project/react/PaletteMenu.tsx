import * as React from 'react';
import {Color} from 'three';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Palette } from '../machine/Palette';
import { Avatar, Box, Checkbox, Stack } from '@mui/material';
import { Construction } from '@mui/icons-material';

let getSelectedPaletteIndex = () => {return 0};
let updateSelectedPaletteIndex = (index:number) => {};
export {getSelectedPaletteIndex, updateSelectedPaletteIndex};

/**
 * Palette selection menu
 * @param props 
 * @returns 
 */
export default function PaletteMenu( props ) {

    const [selectedPalette, setSelectedPalette] = React.useState(Palette.selectedPalette);
    //const open = Boolean(anchorEl);
    const ITEM_HEIGHT = 60;

    getSelectedPaletteIndex = ():number =>
    {
        return selectedPalette;
    }

    updateSelectedPaletteIndex = (index:number) =>
    {
        setSelectedPalette(index);
    }

    const constructPOption = (p:number) => {
        
        const pvalues:number[][] = Palette.paletteValues;
        const bgCol:string = "#" + new Color( pvalues[p][0]).getHexString();
        const c0:string = "#" + new Color( pvalues[p][1]).getHexString();
        const c1:string = "#" + new Color( pvalues[p][2]).getHexString();
        const c2:string = "#" + new Color( pvalues[p][3]).getHexString();
        const c3:string = "#" + new Color( pvalues[p][4]).getHexString();

        return (
            <Box sx={{ m:0.5, p:0, pr:'1em'}}>
                <Stack direction="row" spacing={2}>
                    <Checkbox checked={selectedPalette==p} />
                    <Stack sx={{bgcolor:bgCol , p:1, border:'3px dashed white', borderRadius:'4px'}} direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor:c0 }}> </Avatar>
                        <Avatar sx={{ bgcolor:c1 }}> </Avatar>
                        <Avatar sx={{ bgcolor:c2 }}> </Avatar>
                        <Avatar sx={{ bgcolor:c3 }}> </Avatar>
                    </Stack>
                </Stack>
            </Box>
        )
    }
    const handleClose = (event, index) => 
    {
        if( typeof(index) == "string")
        {
            props.onClose();
        }   
        else 
        {
            setSelectedPalette(index);
            Palette.SetupPalette(index);            
            props.onClose();
        }
    };

    const getOptions = () =>
    {
        const pvalues:number[][] = Palette.paletteValues;

        return (

            pvalues.map((palette, index) => (
                <MenuItem 
                    key={index} 
                    selected={index === selectedPalette} 
                    onClick={(event) => handleClose(event, index)}
                    divider={false} 
                    disableGutters={true}
                    sx={{padding:0, margin:0}}
                >
                    {constructPOption(index)}
                </MenuItem>
            ))

        );
    }


    return (
        <Menu
            id="long-menu"
            
            MenuListProps={{
            'aria-labelledby': 'long-button',
            }}
            anchorEl={props.anchorEl}
            open={props.open}
            onClose={handleClose}
            variant='selectedMenu'
            sx={{padding:0, margin:0}}
            PaperProps={{
                sx:{
                    borderRadius:'4px',
                    border:'1px dashed white',
                    boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
                },
                style: {
                    maxHeight: ITEM_HEIGHT * 4.5,
                    },
            }}
        >
            {getOptions()}
        </Menu>
    )
}