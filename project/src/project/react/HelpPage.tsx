import { Close } from '@mui/icons-material';
import { Box,IconButton,List,Toolbar,Dialog,Typography,Button, Divider, AppBar, ListItem, ListItemText, Slide, Link, styled, Stack } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import * as React from 'react';
import { Module, ModuleType } from '../machine/structs/Module';
import { Assets } from '../../helpers/Assets';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
  ) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

/**
 * Help page
 */
export default function HelpPage(props) 
{
    const [open, setOpen] = React.useState(props.open);  

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        props.onClose();
    };

    const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

    function getBoxStyle( mtype:ModuleType)
    {
        
        
        let icon_url:string = "";
        switch( mtype )
        {
            case ModuleType.Motor:
              icon_url = Assets.MOTOR_ICON;
              break;
            case ModuleType.WaveMod:
              icon_url = Assets.WAVE_ICON;
              break;
            case ModuleType.Block:
              icon_url = Assets.WEIGHT_ICON;
              break;
            case ModuleType.Rotator:
              icon_url = Assets.ROTATOR_ICON;
              break;
            case ModuleType.Spray:
              icon_url = Assets.SPRAY_ICON;
              break;
            case ModuleType.Party:
              icon_url = Assets.BRUSH_ICON;
              break;
            case ModuleType.Perlin:
              icon_url = Assets.PERLIN_ICON;
              break;''
            default:
              icon_url = Assets.WEIGHT_ICON;
              break;

        }
        return {
            
            backgroundImage: `url(${icon_url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '0% 0%',
            display: 'inline-block',
            width: '100px',
            minWidth: '100px',
            height: 'inherit',
            marginTop: '0px',
            marginBottom: '0px',
            marginRight: '20px',
            verticalAlign: 'top',

        }

    }

    const blocksDescriptions = {
        'Weight': 'The weight block can be used to add weight to the machine. It can be set to rotate clockwise or counter-clockwise, and at a speed between 0 and 100%. The weight block can be connected to other blocks to transfer its rotation to them.',
        'Motor': 'The motor is the heart of the machine. It is the only block that can be directly controlled by the user. It can be set to rotate clockwise or counter-clockwise, and at a speed between 0 and 100%. The motor can be connected to other blocks to transfer its rotation to them.',
        'Particle Spray': 'The spray block can be used to spray paint. It can be set to rotate clockwise or counter-clockwise, and at a speed between 0 and 100%. The spray block can be connected to other blocks to transfer its rotation to them.',
        'Brush': 'The party block can be used to create a party-like atmosphere. It can be set to rotate clockwise or counter-clockwise, and at a speed between 0 and 100%. The party block can be connected to other blocks to transfer its rotation to them.',
        'Wave Mod': 
          <Box component='span'>
            <Typography variant='h6'>
              Wave Mod
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
              <b><i>Type</i></b> : Modificator
              <br/>
              <b><i>Description</i></b> :
              The perlin noise influences neighbouring blocks based on a pure wave of a given shape.
              It influences its neighbours as follows :<br/>
              <ul>
                <li>Motor : The power of the motor will fluctuate over time according to the wave length, amplitude and phase.</li>
                <li>Particle spray : The size of the particles produced will change over time.</li>
                <li>Brush : The width of the brush will change over time.</li>
              </ul>
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Wave length : The length of the wave.</li>
                <li>Amplitude : The amplitude of the wave.</li>
                <li>Phase : The phase of the wave.</li>
                <li>Wave shape : The shape of the wave.</li>
              </ul>
            </Typography>
          </Box>,
        'Rotator Mod': 
          <Box component='span'>
            <Typography variant='h6'>
              Rotator Mod
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.5'}}>
              <b><i>Type</i></b> : Modificator
              <br/>
              <b><i>Description</i></b> :
              The rotator mod periodically rotates the block it is connected to by 90 degrees. 
              It can be set to rotate clockwise or counter-clockwise and you can configure the delay between each rotation. 
              It only has any real influence on the blocks that have a direction, such as the motor, the particle spray and the brush.
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Interval : The delay between each rotation.</li>
                <li>Clockwise : Whether the rotation is clockwise or counter-clockwise.</li>
              </ul>
            </Typography>
          </Box>,
        'Perlin Mod': 
          <Box component='span'>
            <Typography variant='h6'>
              Perlin Mod
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.5'}}>
              <b><i>Type</i></b> : Modificator
              <br/>
              <b><i>Description</i></b> :
              The perlin noise influences neighbouring blocks based on a perlin noise, or more precisely on a stack of several simplex noise.
              It produces a smooth noise that looks natural and can be used to create a variety of effects.
              It influences its neighbours as follows :<br/>
              <ul>
                <li>Motor : the direction of the motor will be influenced and try to match the value of the noise according to its position.</li>
                <li>Particle spray : The particules will try to follow directions sampled from the noise and also align themselves accordingly.</li>
                <li>Brush : alters the brush to only appear for certain values of the noise.</li>
              </ul>
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Amplitude : The amplitude of the noise. The higher the value, the more influence it'll have.</li>
                <li>Frequency : The frequency of the noise. The higher the value, the noisier it gets.</li>
                <li>Octaves : The number of 'layers' of the noise. The higher the value, the more complex the noise is.</li>
              </ul>
            </Typography>
          </Box>,
        
    }

    const constructionBlockDetailsContent = () => {

        const blocks = Module.moduleTypes;
        // for each block type, create a block with the icon on the left and some placeholder text of the right
        // return a list of these blocks
        return blocks.map( (block, index) => {
            return (
               /*
                <ListItem sx={{p:0, height:'fit-content', blockSize:'fit-content' }} key={index} >
                    <Box sx={getBoxStyle(block.name)} />
                    
                    <ListItemText 
                        primary={block.name}
                        secondary={blocksDescriptions[block.name]}
                    
                    {blocksDescriptions[block.name]}
                </ListItem>
                /> */               
              <Stack key={index} direction='row' sx={{p:0, pb:4}} >
                  <Box sx={getBoxStyle(block.name)} />
                  {blocksDescriptions[block.name]}
              </Stack>
            )
        })
    }

    return (
        <Dialog
        fullScreen
        open={props.open}
        onClose={handleClose}
        TransitionComponent={Transition}
        
        PaperProps={{
           sx: {
            pointerEvents:'all',
           },

        }}
      >
        <React.Fragment>
        <AppBar position='fixed'>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              HELP
            </Typography>
            
          </Toolbar>
        </AppBar>
        <Offset />
        </React.Fragment>
        {/*
        <List>
          <ListItem button>
            <ListItemText primary="Phone ringtone" secondary="Titania" />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemText
              primary="Default notification ringtone"
              secondary="Tethys"
            />
          </ListItem>
        </List>
        */}
        <Box sx={{ p: 3 }}>
            <Typography sx={{fontFamily:'CabinSketch'}} variant="h4" gutterBottom>
                The Incredible Contraption
            </Typography>
            <Box sx={{ p: 1, textAlign:'left' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Table of content</u>
                </Typography>
                <Typography component={'span'} variant="body1" gutterBottom>
                    <ul>
                        <li><Link href="#about">About</Link></li>
                        <li><Link href="#controls">Controls</Link></li>
                        <ul>
                            <li><Link href="#controls-general">General</Link></li>
                            <li><Link href="#controls-topleft">Top left buttons</Link></li>
                            <li><Link href="#controls-modules">Modules</Link></li>
                        </ul>
                        <li><Link href="#blocks">Construction blocks reference</Link></li>
                    </ul>
                </Typography>
            </Box>
            <Box id='about' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>About</u>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The Incredible Contraption is a game where you can build your own contraption and see if it works. You can place objects on the board and then press the play button to see if the ball reaches the goal. If it does, you win! If it doesn't, you lose.
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat laoreet velit in vehicula. Curabitur eleifend tellus eu scelerisque consectetur. Integer fermentum justo ut mauris scelerisque accumsan. Etiam vitae metus a eros tempor ultricies eu et dui. Integer eget diam tortor. Nam sit amet neque vitae leo lacinia euismod. Donec vel cursus felis, eu bibendum tortor. Donec neque quam, tempus commodo orci a, consectetur accumsan sapien.
                </Typography>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='controls' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Controls</u>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The game is controlled by the mouse. You can move the camera by clicking and dragging. You can zoom in and out by scrolling. You can place objects on the board by clicking on them in the menu on the left and then clicking on the board. You can rotate objects by clicking on them and then pressing the rotate button in the menu on the left. You can delete objects by clicking on them and then pressing the delete button in the menu on the left. You can press the play button in the menu on the left to start the game. You can press the stop button in the menu on the left to stop the game. You can press the reset button in the menu on the left to reset the game.
                </Typography>
                <Box id='controls-general' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        General
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        The game is controlled by the mouse. You can move the camera by clicking and dragging. You can zoom in and out by scrolling. You can place objects on the board by clicking on them in the menu on the left and then clicking on the board. You can rotate objects by clicking on them and then pressing the rotate button in the menu on the left. You can delete objects by clicking on them and then pressing the delete button in the menu on the left. You can press the play button in the menu on the left to start the game. You can press the stop button in the menu on the left to stop the game. You can press the reset button in the menu on the left to reset the game.
                    </Typography>
                </Box>
                <Box id='controls-topleft' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        Top left buttons
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        The top left buttons are used to control the game. The play button is used to start the game. The stop button is used to stop the game. The reset button is used to reset the game.
                    </Typography>
                </Box>
                <Box id='controls-modules' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        Modules
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        The modules are used to place objects on the board. You can click on a module to select it. You can then click on the board to place the object. You can rotate the object by clicking on it and then pressing the rotate button in the menu on the left. You can delete the object by clicking on it and then pressing the delete button in the menu on the left.
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='blocks' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Construction blocks reference</u>
                </Typography>
                <Typography component={'span'} variant="body1" gutterBottom>
                    <List>
                    {constructionBlockDetailsContent()}
                    </List>
                </Typography>
            </Box>
        </Box>


      </Dialog>

  );
}