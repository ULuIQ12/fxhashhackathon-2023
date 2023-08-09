import { Landscape, Portrait, Square } from '@mui/icons-material';
import { Fab, Menu, Stack, Tooltip, Zoom, useTheme } from '@mui/material';
import * as React from 'react';
import { Designer, RunAR } from '../Designer';

export default function ARMenu( props ) {

    //const [open, setOpen] = React.useState(props.open);
    //const [anchorPosition, setAnchorPosition] = React.useState<null | { top: number; left: number }>({top:0,left:0});

    const ARActions = [
        { icon: <Square />, name: RunAR.Square },
        { icon: <Portrait />, name: RunAR.Portrait },
        { icon: <Landscape />, name: RunAR.Landscape },
    ];

    function handleARSelection(event, index)
    {
        //console.log( "handleARSelection: " + index);
        Designer.instance.updateSpaceAR(index);
        //setARDialOpen(false);
        props.onClose();
    }

    const theme = useTheme();
    
    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    return (
        <Menu
            anchorEl={props.anchorEl}
            anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
            transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            open={props.open}
            onClose={props.onClose}
            sx={{
                '& .MuiMenu-paper': {
                    backgroundColor:'rgba(0,0,0,0)',
                    boxShadow: 'none',

                },
                position: 'fixed',
                marginLeft: '20px',


            }}
        >
            <Stack direction="row" spacing={2} >
                {ARActions.map((action, index) => (
                    <Zoom key={index} in={true} timeout={transitionDuration} style={{ transitionDelay:index*50 +"ms"}}>
                    <Tooltip title={action.name} key={action.name} placement='top'>
                        <Fab
                            size="small"
                            color='primary'
                            key={action.name}
                            onClick={(event) => handleARSelection(event, action.name)}
                        >
                        {action.icon}
                        </Fab>
                    </Tooltip>
                    </Zoom>
                ))}
            </Stack>
        </Menu>
    )
}