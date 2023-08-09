import { Vector2 } from '@dimforge/rapier2d';
import { BrushOutlined, Camera, DesignServices, Portrait } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, List, ListItem, ListItemText, ListSubheader, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { Project } from '../Project';
import { Designer, RunAR } from '../Designer';

/**
 * Menu with options the export captures. Actual capture is done in Project.ts
 * @param props 
 * @returns 
 */
export default function CaptureMenu(props) {

    const [open, setOpen] = React.useState(props.open);
    const [bpResolution, setBpResolution] = React.useState(0);
    const [artResolution, setArtResolution] = React.useState(0);

    const handleDoneBtClick = () => 
    {
        setOpen(false);
        props.onClose();
    }

    const handleArtResChange = (event:any) =>
    {
        setArtResolution(parseInt(event.target.value));
    }

    const handleBpResChange = (event:any) =>
    {
        setBpResolution(parseInt(event.target.value));
    }

    const getArtCaptureResOptions = () =>
    {
        const resolutions:Vector2[][] = Project.instance.captureResolution;
        const ar:RunAR = Designer.instance.currentAR;
        const arIndex:number = Object.values(RunAR).indexOf(ar);
        const arResOptions:Vector2[] = resolutions[arIndex];

        return (
            arResOptions.map((res:Vector2, index:number) => {
                return (
                    <MenuItem key={index} value={index}>{res.x}x{res.y}</MenuItem>
                )
            })
        )
    }

    const getBPCaptureResOptions = () =>
    {
        const bpResOptions:Vector2[] = Project.instance.blueprintResolution;
        return (
            bpResOptions.map((res:Vector2, index:number) => {
                return (
                    <MenuItem key={index} value={index}>{res.x}x{res.y}</MenuItem>
                )
            })
        )
    }

    const handleCaptureArtClick = () => {

        const res:Vector2 = Project.instance.captureResolution[Object.values(RunAR).indexOf(Designer.instance.currentAR)][artResolution];
        Project.instance.requestCapture(res);

    }

    const handleCaptureBPClick = () => {
            
            const res:Vector2 = Project.instance.blueprintResolution[bpResolution];
            Project.instance.requestBPCapture(res);    
    }   

    return (
        <Dialog
            open={props.open}
            aria-labelledby="capture menu"
            aria-describedby="capture menu"
            maxWidth="sm"
            PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
            }}}
            >
            <DialogTitle sx={{textAlign:'left' , ml:'30px'}}><Camera sx={{
                position:'absolute',
                top:'20px',
                left:'20px',
             }}/> Exports</DialogTitle>
            <DialogContent sx={{textAlign:'left', p:0}}>
                <List 
                    component="nav"
                    sx={{ m:2, p:0.5, border:'1px dashed white', borderRadius:'4px'}}
                >
                    <ListItem key={0}><ListItemText 
                        primary={<i>Export a PNG capture of the ARTWORK</i>}
                        secondary='Captures the current state of the artwork'
                    /></ListItem>
                    <ListItem key={1}>
                        <ListItemText primary='Resolution :'/>
                        <Select
                            sx={{width:'70%'}}
                            labelId="Art Resolution select"
                            id="Art-Resolution-select"
                            value={artResolution}
                            label=""
                            onChange={handleArtResChange}
                        >
                            {getArtCaptureResOptions()}
                        </Select>
                    </ListItem>
                    <ListItem key={2}><Button onClick={handleCaptureArtClick} size='large' variant='outlined' startIcon={<BrushOutlined/>}>Export artwork</Button></ListItem>
                </List>
                
                

                <List 
                    component="nav"
                    sx={{ m:2, p:0.5, border:'1px dashed white', borderRadius:'4px'}}
                >
                    <ListItem key={0}><ListItemText 
                        primary={<i>Export a PNG capture of the BLUEPRINT</i>}
                        secondary='Warning : this will reset the current run'
                    /></ListItem>
                    <ListItem key={1}>
                        <ListItemText primary='Resolution :'/>
                        <Select
                            sx={{width:'70%'}}
                            labelId="Blueprint Resolution select"
                            id="Blueprint-Resolution-select"
                            value={bpResolution}
                            label=""
                            onChange={handleBpResChange}
                        >
                            {getBPCaptureResOptions()}
                        </Select>
                    </ListItem>
                    <ListItem key={2}><Button onClick={handleCaptureBPClick} size='large' variant='outlined' startIcon={<DesignServices/> }>Export blueprint</Button></ListItem>
                </List>

            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={handleDoneBtClick}>Done</Button>
            </DialogActions>
        </Dialog>
    )
}