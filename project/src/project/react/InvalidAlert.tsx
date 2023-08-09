import { Warning } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import * as React from 'react';

/**
 * Alert for when a design lacks the necesseary requirements
 * @param props 
 * @returns 
 */
export default function InvalidAlert(props) {

    const [open, setOpen] = React.useState(props.open);

    function handleOpen()
    {
        setOpen(true);
    }

    function handleClose()
    {
        setOpen(false);
        props.onClose();
    }

    return (
        <Dialog
            open={props.open}
            aria-labelledby="machine invalid alert"
            aria-describedby="machine invalid alert"
            maxWidth="xs"
            PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
            }}}
          >
            <DialogTitle>
              <Warning fontSize='large' /><br/>
              Your incredible contraption needs <b>at least one drawing block</b> (Spray or Brush).
            </DialogTitle>
            <DialogActions sx={{
                alignContent:'center',
                justifyContent:'center'
            }}>
              <Button sx={{marginBottom:'1em'}} color ="primary" size="large" variant="outlined" onClick={handleClose}>OK</Button>
            </DialogActions>

        </Dialog>
    );
}