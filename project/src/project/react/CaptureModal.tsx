import { Box, Dialog, DialogTitle, DialogContent, LinearProgress, Modal, Typography } from '@mui/material';
import * as React from 'react';

let updateProgress = (progress:number) => {};
export {updateProgress};

/**
 * Modal that appears when the user clicks the capture button. Displays capture progress
 * @param props 
 * @returns 
 */
export default function CaptureModal( props ) {

    updateProgress = (progress:number) => {
        setProgress( Math.round( progress * 100 ) );
    }

    const [progress, setProgress] = React.useState(0);

    return (
        <Dialog

            open={props.open}
            aria-labelledby="capture_progress"
            aria-describedby="progress bar of the capture process"
            BackdropProps={{sx:{backgroundColor:'background.paper'}}}
            PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
            }}}
            >
            <DialogTitle>Please wait while we render your contraption</DialogTitle>
            <DialogContent>
                <LinearProgress  variant="determinate" color="warning" value={progress} />
            </DialogContent>
        </Dialog>
    )
}