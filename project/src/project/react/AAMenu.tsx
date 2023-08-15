import { BlurOn, Landscape, Portrait, Square } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem,  List, ListItem, ListItemText, Fab, Menu, Stack, Tooltip, Zoom, useTheme, Select, Switch } from '@mui/material';
import * as React from 'react';
import { Designer, RunAR } from '../Designer';
import { Project } from '../Project';

export default function AAMenu( props ) {

    const [open, setOpen] = React.useState(props.open);
    const [autoAdjust, setAutoAdjust] = React.useState(Project.instance.autoAdujstAA);
    const [quality, setQuality] = React.useState(Project.instance.AAQuality);

    React.useEffect(() => {
        setQuality(Project.instance.AAQuality);
        setAutoAdjust(Project.instance.autoAdujstAA);
    }, [props.open])

    const handleDoneBtClick = () => 
    {
        setOpen(false);
        props.onClose();
    }

    const onAutoAdjustChange = (e) => {
        setAutoAdjust(e.target.checked);
    }

    const handleQualityChange = (e) => {
        Project.instance.AAQuality = e.target.value;
        setQuality(e.target.value);
    }

    return (
        <Dialog
            open={props.open}
            onClose={props.onClose}
            fullWidth={true}
            maxWidth={"xs"}
            PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
            }}}
        >
            <DialogTitle sx={{textAlign:'left' , ml:'30px'}}><BlurOn sx={{
                position:'absolute',
                top:'20px',
                left:'20px',
             }}/> Anti-aliasing</DialogTitle>
            <DialogContent>
                <List component="nav"
                    sx={{ m:0, p:0.5, border:'1px dashed white', borderRadius:'4px'}}>
                    <ListItem>
                        <ListItemText primary='Anti-aliasing is the method by which you can eliminate "jaggies" in computer images.
                             Here the technique used looks nice but comes at a heavy performance cost. If you feel your browser lagging,
                             try adjusting this value.'/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Quality :'/>
                        <Select 
                            sx={{width:'70%'}} 
                            onChange={handleQualityChange} 
                            value={quality}
                        >
                            <MenuItem key={0} value={1}>Low</MenuItem>
                            <MenuItem key={1} value={2}>Medium</MenuItem>
                            <MenuItem key={2} value={3}>High</MenuItem>
                            <MenuItem key={3} value={4}>Ideal</MenuItem>
                        </Select>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button variant='outlined' onClick={handleDoneBtClick}>Done</Button>
            </DialogActions>
        </Dialog>
                
    )
}