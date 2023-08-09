import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Fab, Fade, FormControlLabel, InputAdornment, SpeedDial, SpeedDialAction, Stack, Switch, TextField, ThemeProvider, Tooltip, Typography, Zoom, useTheme } from '@mui/material';
import * as React from 'react';
import ModuleMenu from './ModuleMenu';
import BlockDrawer from './BlocksDrawer';
import { Apps, AspectRatio, Cancel, CancelOutlined, Casino, CasinoOutlined, CreateOutlined, Delete, DeleteOutline, DeleteOutlineOutlined, Help, Landscape, Palette, Portrait, PrecisionManufacturing, PriorityHigh, PriorityHighOutlined, QuestionMark, RocketLaunch, SettingsApplications, ShuffleOutlined, Square, Warning } from '@mui/icons-material';
import { Build } from '../machine/Build';
import EditModule from './EditModule';
import OrientationMenu from './OrientationMenu';
import PaletteMenu from './PaletteMenu';
import { Designer, RunAR } from '../Designer';
import InvalidAlert from './InvalidAlert';
import HelpPage from './HelpPage';
import { Params } from '../../helpers/Params';
import { Project } from '../Project';
import ARMenu from './ARMenu';

let openModuleEditMenu = (data) => {};

let hasAnyMenuOpen = ():boolean => {return false};

export {openModuleEditMenu, hasAnyMenuOpen};


/**
 * Component with the various UI for Build mode
 * @param param0 
 * @returns 
 */
//export default function BuildUI({changeModeCallback}) {
export default function BuildUI(props) {

    

    const [aRDialOpen, setARDialOpen] = React.useState(false);
    const [arAnchorEl, setArAnchorEl] = React.useState<null | HTMLElement>(null);
    const [editOpen, setEditOpen] = React.useState(false);
    const [validAlertOpen, setValidAlertOpen] = React.useState(false);
    
    const [moduleEditData, setModuleEditData] = React.useState({} || null);
    const [helpOpen, setHelpOpen] = React.useState(false);

    const [selectPaletteOpen, setSelectPaletteOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const [autoConfirmOpen, setAutoConfirmOpen] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(false);

    const [showAutoWarning, setShowAutoWarning] = React.useState(props.showAutoWarning);
    const [showDeleteWarning, setShowDeleteWarning] = React.useState(props.showDeleteWarning);

    //const [title, setTitle] = React.useState("");
    const [title, setTitle] = React.useState(Params.getParam(Project.TITLE_PARAM_ID));
    const [titleSize, setTitleSize] = React.useState(250);

    const theme = useTheme();
    
    const transitionDuration = {
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
    };

    hasAnyMenuOpen = () =>
    {
        return (editOpen || deleteConfirm || selectPaletteOpen || aRDialOpen || helpOpen || validAlertOpen || autoConfirmOpen);
    }

    openModuleEditMenu = (data) => 
    {
        setModuleEditData(data);
        setEditOpen(true);
    }

    const handleEditModuleClose = () => 
    {
        setEditOpen(false);
    }

    function onChangeModeClick(event)
    {
        const isValid:boolean = Build.instance.isMachineValid();
        if(!isValid)
        {
            setValidAlertOpen(true);
        }
        else
            props.changeModeCallback();
    }

    function onDeleteClick(event)
    {
        Build.Clear();
        setDeleteConfirm(false);
        props.updateShowDeleteWarning(showDeleteWarning);
    }

    function handleDeleteModelOpen(event)  
    {
        if( props.showDeleteWarning)
            setDeleteConfirm(true);
        else 

            onDeleteClick(event);
    }

    function handleHelpClick(event)
    {
        setHelpOpen(true);
    }

    function handleDeleteModelClose(event) 
    {
        setDeleteConfirm(false);
        props.updateShowDeleteWarning(showDeleteWarning);
    }

    function handleAutoClick(event)
    {

        if( props.showAutoWarning )
            setAutoConfirmOpen(true);
        else 
            autoBuild();
    }

    function autoBuild()
    {
        Build.Clear(false);
        Build.instance.autoBuildRandomMachine();

        props.updateShowAutoWarning(showAutoWarning);
        setAutoConfirmOpen(false);
    }

    function handleSelectPaletteOpen(event)
    {
        setAnchorEl(event.currentTarget);
        setSelectPaletteOpen(true);
    }

    function handleInvalidAlertClose(event)
    {
        setValidAlertOpen(false);
    }

    function handleHelpClose(event)
    {
        setHelpOpen(false);
    }
    
    const ARActions = [
        { icon: <Square />, name: RunAR.Square },
        { icon: <Portrait />, name: RunAR.Portrait },
        { icon: <Landscape />, name: RunAR.Landscape },
    ];

    function handleARSelection(event, index)
    {
        //console.log( "handleARSelection: " + index);
        Designer.instance.updateSpaceAR(index);
        setARDialOpen(false);
    }

    function handleAROpen(event)
    {

        //console.log( "handleAROpen: ", event.currentTarget, event);
        setArAnchorEl(event.currentTarget);
        setARDialOpen(!aRDialOpen);
    }

    function handleARClose(event)
    {
        setARDialOpen(false);
    }

    function handlePaletteClose(event)
    {
        setSelectPaletteOpen(false);
    }

    
    function handleAutoWarningClose(event)
    {

        setAutoConfirmOpen(false);
        props.updateShowAutoWarning(showAutoWarning);
    }

    function handleDeleteWarningChange(event)
    {
        //props.updateShowDeleteWarning(event.target.checked);
        setShowDeleteWarning(event.target.checked);
    }


    function handleAutoWarningChange(event)
    {
        //props.updateShowAutoWarning(event.target.checked);
        setShowAutoWarning(event.target.checked);
    }

    const span = React.useRef(null);
    React.useEffect(() => {
        //console.log( "title length: " , span.current.offsetWidth);
        setTitleSize( Math.max( 250, span.current.offsetWidth + 80) );
      }, [title]);

    function handleTitleChange(event)
    {
        setTitle(event.target.value);
    }

    function handleOnBlur(event)
    {
        if( title != Params.getParam(Project.TITLE_PARAM_ID))
        {
            Project.instance.updateTitle(title);
            Designer.instance.updateTitle(title);
        }
    }

    function handleTitleKeyPress(event) 
    {
        if (event.key === 'Enter') 
        {
            event.target.blur();
        }
    }

    return (
        <Box sx={{bgcolor:'#0f477f'}}>
            <ThemeProvider theme={theme}>
            <ModuleMenu/>
            <OrientationMenu />
            <BlockDrawer/>
            <InvalidAlert open={validAlertOpen} onClose={handleInvalidAlertClose}/>
            <Box id="TopLeftButtons" sx={{
                position:'absolute',
                left: '1em',
                top: '1em',
                pointerEvents: 'all',
                
              }} >
                <Stack direction="column" spacing={2}>
                    <Zoom 
                        in={true} 
                        timeout={transitionDuration} 
                        unmountOnExit>
                        <Tooltip title="Launch your contraption!" placement="right">
                            <Fab sx={{ width: 70, height: 70 }} color="primary" aria-label="run" onClick={onChangeModeClick}>
                                <RocketLaunch />
                            </Fab>
                        </Tooltip>
                    </Zoom>
                    <Zoom 
                        in={true} 
                        timeout={transitionDuration} 
                        style={{ transitionDelay:'100ms'}}
                        unmountOnExit>
                        <Tooltip title="Choose a color palette" placement="right">
                            <Fab color="primary" aria-label="chosse palette" onClick={handleSelectPaletteOpen}>
                                <Palette />
                            </Fab>
                            
                        </Tooltip>
                        
                    </Zoom>
                    <Zoom 
                        id="ARButton"
                        in={true} 
                        timeout={transitionDuration} 
                        style={{ transitionDelay:'200ms'}}
                        unmountOnExit>
                        <Tooltip title="Edit aspect ratio" placement="right">
                            <Fab color="primary" aria-label="aspectratio" size='medium' onClick={handleAROpen}>
                                <AspectRatio />
                            </Fab>
                        </Tooltip>
                        
                    </Zoom>
                    <Zoom 
                        in={true} 
                        timeout={transitionDuration} 
                        style={{ transitionDelay:'300ms'}}
                        unmountOnExit>
                        <Tooltip title="Delete your contraption" placement="right">
                            <Fab color="primary" aria-label="delete" size='medium' onClick={handleDeleteModelOpen}>
                                <Delete />
                            </Fab>
                        </Tooltip>                        
                    </Zoom>
                    <Zoom 
                        in={true} 
                        timeout={transitionDuration} 
                        style={{ transitionDelay:'400ms'}}
                        unmountOnExit>
                        <Tooltip title="Generate a new random contraption" placement="right">
                            <Fab color="primary" aria-label="random" size='medium' onClick={handleAutoClick}>
                                <PrecisionManufacturing />
                            </Fab>
                        </Tooltip>
                        
                    </Zoom>
                    <Zoom 
                        in={true} 
                        timeout={transitionDuration} 
                        style={{ transitionDelay:'500ms'}}
                        unmountOnExit>
                        <Tooltip title="Help" placement="right">
                            <Fab color="primary" aria-label="help" size='medium' onClick={handleHelpClick}>
                                <QuestionMark />
                            </Fab>
                        </Tooltip>
                        
                    </Zoom>
                    
                </Stack>
            </Box>
            <span style={{position:'absolute', backgroundColor:'rgba(0,0,0,0)', opacity:'0'}} ref={span}>{title}</span>
            <Box id="TopRightButtons" sx={{
                position:'absolute',
                right: '1em',
                top: '1em',
                pointerEvents: 'all',                
              }} >
                <TextField 
                    InputProps={{
                        
                        startAdornment: (
                        <InputAdornment position="start">
                            <CreateOutlined color='primary'/>
                        </InputAdornment>
                        ),
                    }}
                    sx={{width:titleSize}}
                    inputProps={{ maxLength: 32 }}
                    onBlur={handleOnBlur}
                    onKeyPress={handleTitleKeyPress}
                    type="text"
                    placeholder="Your contraption's title"
                    id="contraption_title"
                    label="Title" 
                    value={title}
                    fullWidth
                    onChange={handleTitleChange}
                    variant="outlined" />
            </Box>
            <Dialog
                open={autoConfirmOpen}
                onClose={handleAutoWarningClose}
                aria-describedby="alert-dialog-slide-description"
                PaperProps={{sx:{
                    borderRadius:'4px',
                    border:'1px dashed white',
                    boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
                }}}
            >
                <DialogTitle>
                    <Warning fontSize='large' /><br/>
                    This action will <b>delete the current contraption</b> and generate a new random one, as well as randomize the selected palette and aspect ratio.
                </DialogTitle>
                <DialogContent sx={{pt:'1em', pb:0}}>
                    <FormControlLabel control={<Checkbox size='small' checked={showAutoWarning} onChange={handleAutoWarningChange}/>} label="Show this warning" />
                </DialogContent>
                <DialogActions>
                        <Button sx={{margin:'1em'}} color="secondary" size="medium" variant="outlined" endIcon={<CancelOutlined sx={{mb:0.15}} />} onClick={handleAutoWarningClose}>Cancel</Button>
                        <Button sx={{margin:'1em'}} color ="primary" size="medium" variant="outlined" endIcon={<ShuffleOutlined sx={{mb:0.15}} />} onClick={autoBuild}>Randomize</Button>
                </DialogActions>

            </Dialog>
            <Dialog
                open={deleteConfirm}
                onClose={handleDeleteModelClose}
                aria-describedby="alert-dialog-slide-description"
                PaperProps={{sx:{
                    borderRadius:'4px',
                    border:'1px dashed white',
                    boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
                }}}
            >
                <DialogTitle>
                    <Warning fontSize='large' /><br/>
                    Are you sure you want to <b>delete all blocks</b>?
                </DialogTitle>
                <DialogContent sx={{pt:'1em', pb:0}}>
                    <FormControlLabel control={<Checkbox size='small' checked={showDeleteWarning} onChange={handleDeleteWarningChange} />} label="Show this warning" />
                </DialogContent>
                <DialogActions>                    
                    <Button sx={{margin:'1em'}} color="secondary" size="medium" variant="outlined" endIcon={<CancelOutlined sx={{mb:0.15}} />} onClick={handleDeleteModelClose}>Cancel</Button>
                    <Button sx={{margin:'1em'}} color ="primary" size="medium" variant="outlined" endIcon={<DeleteOutline sx={{mb:0.15}} />} onClick={onDeleteClick}>Delete</Button>                        
                </DialogActions>
            </Dialog>
            <ARMenu open={aRDialOpen} anchorEl={arAnchorEl} onClose={handleARClose} />
            <PaletteMenu open={selectPaletteOpen} anchorEl={anchorEl} onClose={handlePaletteClose} />
            <EditModule open={editOpen} onClose={handleEditModuleClose} data={moduleEditData} />
            <HelpPage open={helpOpen} onClose={handleHelpClose} />
            </ThemeProvider>
        </Box>
    )
}