import { Box, Button, ButtonGroup, Fab, Fade, IconButton, LinearProgress, Stack, Tooltip, Zoom, useTheme } from '@mui/material';
import * as React from 'react';
import ModuleMenu from './ModuleMenu';
import BlockDrawer from './BlocksDrawer';
import { BlurOn, Camera, DesignServices, Pause, PlayArrow, RocketLaunch, SettingsApplications, Stop } from '@mui/icons-material';
import { Execute } from '../machine/Execute';
import { Project } from '../Project';
import { FXContext } from '../../helpers/FXSnippet';
import CaptureModal from './CaptureModal';
import CaptureMenu from './CaptureMenu';
import AAMenu from './AAMenu';
import { Params } from '../../helpers/Params';

let exeInstance:any = null;
let updatePlayerProgress = (progress:number) => {};
let isRunUIVisible = ():boolean => {return true};
let setRunUIVisible = (visible:boolean) => {};
let setExeInstance = (exe:Execute) => {exeInstance = exe};

let onCaptureStart = () => {};
let onCaptureEnd = () => {};


export {updatePlayerProgress, isRunUIVisible, setRunUIVisible, setExeInstance, onCaptureEnd, onCaptureStart};


/**
 * Component with the various UI for Execute mode
 * @param param0 
 * @returns 
 */
export default function RunUI({changeModeCallback}) {

    const [progress, setProgress] = React.useState(0);
    const [visible, setVisible] = React.useState(true);
    const [captureMenuVisible, setCaptureMenuVisible] = React.useState(false);
    const [captureModalVisible, setCaptureModalVisible] = React.useState(false);
    const [aaOpen, setAAOpen] = React.useState(false);

    const theme = useTheme();
    const extProgress = React.useRef(0);
    

    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    updatePlayerProgress = (progress:number) => {
        //setProgress( progress * 100);
        extProgress.current = progress * 100;
    }

    React.useEffect(() => {
        const timer = setInterval(() => {
            if( extProgress.current != progress)
            {
                setProgress(extProgress.current);
            }
        }, 33);
        return () => clearInterval(timer);
    });


    isRunUIVisible = ():boolean => {
        return visible;
    }

    setRunUIVisible = (visiblee:boolean) => {
        setVisible(visiblee);
    }

    onCaptureStart = () => {
        //console.log("onCaptureStart react")
        setCaptureModalVisible(true);
    }

    onCaptureEnd = () => {
        //console.log("onCaptureEnd react")
        setCaptureModalVisible(false);
    }

    const onPlayClick = (event) => {
        //console.log("onPlayClick");
        //Execute.Play();
        if( exeInstance != null)
            exeInstance.play();
    }

    const onPauseClick = (event) => {
        //console.log("onPauseClick");
        //Execute.Pause();
        if( exeInstance != null)
            exeInstance.pause();
    }

    const onStopClick = (event) => {
        //console.log("onStopClick");
        //Execute.Stop();
        if( exeInstance != null)
            exeInstance.stop();
    }

    const onChangeModeClick = (event) => {
        //console.log("onChangeModeClick");
        changeModeCallback();
    }

    const onCaptureClick = (event) => {
        setCaptureMenuVisible(true);
    }

    const handleCaptureMenuClose = () => {
        setCaptureMenuVisible(false);
    }

    const getTitle = () => {
        const titleStr:string = Params.getParam(Project.TITLE_PARAM_ID);
        if( titleStr == null || titleStr == "")
            return ("");
        else
            return (
                titleStr
            );
    }

    const onAAClick = (event) => {
        setAAOpen(true);
    }

    const handleAAClose = () => {
        setAAOpen(false);
    }

    function GetTopLeftButtons()
    {
        if( Project.GetContext() == FXContext.MINTING || ( Project.GetContext() == FXContext.STANDALONE && Project.SUPER_SECRET_CHEAT_MODE_ENABLED) )
        //if( true )
        {
            return (
                <Stack direction="column" spacing={2}>
                    <Zoom in={true} timeout={transitionDuration} unmountOnExit>
                        <Tooltip title="Switch to build mode" placement="right">
                            <Fab sx={{ width: 70, height: 70 }} color="primary" aria-label="run" onClick={onChangeModeClick}>
                                <DesignServices />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                    <Zoom in={true} timeout={transitionDuration} style={{ transitionDelay:'100ms'}} unmountOnExit>
                        <Tooltip title="Export a png capture" placement="right">
                            <Fab color="primary" aria-label="run" onClick={onCaptureClick}>
                                <Camera />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                    <Zoom in={true} timeout={transitionDuration} style={{ transitionDelay:'200ms'}} unmountOnExit>
                        <Tooltip title="Adjust anti-alilasing" placement="right">
                            <Fab color="primary" aria-label="run" size='small' onClick={onAAClick}>
                                <BlurOn />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                </Stack>
            )
        }
        else 
        {
            return (
                <Stack direction="column" spacing={2}>
                    <Zoom in={true} timeout={transitionDuration} unmountOnExit>
                        <Tooltip title="Export a png capture" placement="right">
                            <Fab color="primary" aria-label="run" onClick={onCaptureClick}>
                                <Camera />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                    <Zoom in={true} timeout={transitionDuration} style={{ transitionDelay:'200ms'}} unmountOnExit>
                        <Tooltip title="Adjust anti-alilasing" placement="right">
                            <Fab color="primary" aria-label="run" size='small' onClick={onAAClick}>
                                <BlurOn />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                </Stack>
            )
        }
    }


    return (
        <Box >
            
            <Fade in={visible} timeout={transitionDuration}>
                <Box>
                <Box sx={{
                    position: 'absolute',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    width: '100%',
                    bottom:'2em',
                    fontFamily:'CabinSketch',
                    fontSize:'1.6em',
                    textShadow:'0px 0px 20px rgba(0,0,0,1), 0px 0px 10px rgba(0,0,0,1), 0px 0px 2px rgba(0,0,0,1)', // wtf
                    color:'#ffffff',
                    paddingLeft:'0.7em',
                    paddingRight:'0.7em',
                    pointerEvents:'none',
                }}
                >
                    {getTitle()}
                </Box>
                <Box sx={{
                    position: 'absolute',
                    alignItems: 'left',
                    verticalAlign: 'middle',
                    width: '100%',
                    height: '3em',
                    bottom: '0px',
                    }}>
                    <Box sx={{display:'flex', float:'left', marginLeft:'0',padding:'0', mt:'auto', mb:'auto', height:'100%', verticalAlign:'middle'}}>
                        <ButtonGroup variant='outlined'>
                            <IconButton color="warning" sx={{pointerEvents:'all'}}  onClick={onPlayClick}><PlayArrow/></IconButton>
                            <IconButton color="warning" sx={{pointerEvents:'all'}}  onClick={onPauseClick}><Pause/></IconButton>
                            <IconButton color="warning" sx={{pointerEvents:'all'}} onClick={onStopClick}><Stop/></IconButton>
                        </ButtonGroup>
                    </Box>
                    <Box sx={{display:'flex', marginRight:'0', marginLeft:'0', height:'100%',  padding:'1em'}}>
                        <LinearProgress sx={{display:'flex', mt:'auto', mb:'auto', width:'100%', height:'10px', pl:'1em', pr:'1em'}} color='warning' variant="determinate" value={progress} />
                    </Box>
                </Box>
                </Box>
            </Fade>
            <Fade in={visible} timeout={transitionDuration}>
                <Box id="TopLeftButtons" sx={{
                    position:'absolute',
                    left: '1em',
                    top: '1em',
                    pointerEvents: 'all',
                    
                }} >
                    {GetTopLeftButtons()}
                </Box>
            </Fade>
            <CaptureMenu open={captureMenuVisible} onClose={handleCaptureMenuClose} /> 
            <AAMenu open={aaOpen} onClose={handleAAClose} />
            <CaptureModal open={captureModalVisible}/>
            
        </Box>
    )
}