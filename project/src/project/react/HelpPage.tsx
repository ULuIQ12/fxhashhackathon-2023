import { Architecture, AspectRatio, BlurOn, Brush, Camera, CenterFocusStrong, Close, ContentCopy, Delete, DesignServices, Help, Mouse, Palette, PanTool, PrecisionManufacturing, QuestionMark, RocketLaunch, Settings, SettingsSuggest, Sync, ZoomIn } from '@mui/icons-material';
import { Box,IconButton,List,Toolbar,Dialog,Typography,Button, Divider, AppBar, ListItem, ListItemText, Slide, Link, styled, Stack, Avatar } from '@mui/material';
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
              break;
            case ModuleType.Switch:
              icon_url = Assets.SWITCH_ICON;
              break;
            case ModuleType.Stamp:
              icon_url = Assets.STAMP_ICON;
              break;
            case ModuleType.Rocket:
              icon_url = Assets.ROCKET_ICON;
              break;
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

    const blockDescStyle = {
        borderRadius:'4px',
        border:'1px dashed white',
        boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
    }

    const blocksDescriptions = {
        'Weight': 
        <Box component='span' >
          <Typography variant='h6'>
            Weight
          </Typography>
          <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
            <b><i>Type</i></b> : Structural <Architecture fontSize='small' sx={{mb:-.6}}/>
            <br/>
            <b><i>Description</i></b> :
            The Weight block add weight to the machine. All blocks have a weight that influences the mouvement of the contraption, 
            but the weight block is the only one with a weight that can be set by the user.
            <br />
            It is also neutral and can't be modified by modificators.
            <br/>
            <b><i>Properties</i></b> :
            <ul>
              <li>Mass : The mass of the block.</li>
            </ul>
          </Typography>
        </Box>,
        'Motor': 
        <Box component='span'>
          <Typography variant='h6'>
            Motor
          </Typography>
          <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
            <b><i>Type</i></b> : Structural <Architecture fontSize='small' sx={{mb:-.6}}/>
            <br/>
            <b><i>Description</i></b> :
            The Motor block adds a linear force where it is placed in the blueprint in the direction it is pointing.
            It's the main way to get your contraption to move.
            <br/>
            <b><i>Properties</i></b> :
            <ul>
              <li>Power : How strong is the force it applies.</li>
              <li>Power noise : How much noise is applied the forward direction. The more noise, the more jittery the motor will behave.</li>
              <li>Direction noise: Noise applied to the direction of the motor each simulation step. Maximum value represent a range of 90°.</li>
            </ul>
          </Typography>
        </Box>,
         'Rocket': 
         <Box component='span'>
           <Typography variant='h6'>
            Rocket
           </Typography>
           <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
             <b><i>Type</i></b> : Structural <Architecture fontSize='small' sx={{mb:-.6}}/>
             <br/>
             <b><i>Description</i></b> :
             The Rocket block adds a linear force where it is placed in the blueprint in the direction it is pointing, but only for a determined duration and after a user-defined delay.
             <br/>
             <b><i>Properties</i></b> :
             <ul>
               <li>Power : How strong is the force it applies.</li>
               <li>Start delay : After how long the rocket launches. Maximum value is roughly half of the total simulation length.</li>
               <li>Burn duration : How long does the rocket burn. Maximum value is roughly half of the total simulation length.</li>
               <li>Power noise : How much noise is applied the forward direction. The more noise, the more jittery the motor will behave.</li>
               <li>Direction noise: Noise applied to the direction of the motor each simulation step. Maximum value represent a range of 90°.</li>
             </ul>
           </Typography>
         </Box>,
        'Particle Spray': 
        <Box component='span'>
          <Typography variant='h6'>
            Particle Spray
          </Typography>
          <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
            <b><i>Type</i></b> : Drawing <Brush fontSize='small' sx={{mb:-.6}}/>
            <br/>
            <b><i>Description</i></b> :
            The Particle Spray sends color particles flying in the direction it is pointing. The number of particles launched is determined by its properties.
            For instance, if physics collision are enabled, less particles will be spawned to aleviate the performance cost.
            <br/>
            <b><i>Properties</i></b> :
            <ul>
              <li>Color : What color from the palette are the particles. Random select randomly for each particle. Rotating interpolate the color over time, producing gradients.</li>
              <li>Power : How far will the particles be launched.</li>
              <li>Power noise : How much noise is applied the launch force. Two particles perfectly on top of each other is not very interesting, so a little noise can help.</li>
              <li>Direction noise: Noise applied to the direction of the launch force. Maximum value represent a range of 90°.</li>
              <li>Size : the size of the particles. Warning : big particles can fill the screen pretty fast.</li>
              <li>Shape : A selection of shapes for the particles.</li>
              <li>Collides with frame : do the particles collide with the artwork's frame. The particles will bounce off the frame if the toggle is enabled.</li>
              <li>Collides with other particles : do the particles collide with other particles, not only with  particles coming from this spray,
                but also with particles coming from other sprays with this setting enabled. The particles will bounce off each other if the toggle is enabled.</li>
            </ul>
          </Typography>
        </Box>,
        'Brush': 
        <Box component='span'>
          <Typography variant='h6'>
            Brush
          </Typography>
          <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
            <b><i>Type</i></b> : Drawing <Brush fontSize='small' sx={{mb:-.6}}/>
            <br/>
            <b><i>Description</i></b> :
            The Brush paints a line of color. Depending on the power properties, in can also "throw" the paint in the direction it is pointing.
            <br/>
            <b><i>Properties</i></b> :
            <ul>
              <li>Color : What color from the palette is the paint. Random selects a color among the four colors from the palette. Rotating interpolate the color over time, producing a gradient along the lenght of the strokes.</li>
              <li>Power : How far is the paint launched.</li>
              <li>Power noise : How much noise is applied the launch direction. The more noise, the more jittery the line of paint will be.</li>
              <li>Direction noise: Noise applied to the direction of the launch. Maximum value represent a range of 90°.</li>
              <li>Width : The size of the brush.</li>
              <li>Width noise : How much noise is applied to the width of the brush. The more noise, the more jittery the width of the brush will be.</li>
              <li>Collide with frame : does the paint collide with the artwork's frame. The paint will bounce off the frame if the toggle is enabled.</li>
            </ul>
          </Typography>
        </Box>,
        'Stamp': 
        <Box component='span'>
          <Typography variant='h6'>
          Stamp
          </Typography>
          <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
            <b><i>Type</i></b> : Drawing <Brush fontSize='small' sx={{mb:-.6}}/>
            <br/>
            <b><i>Description</i></b> :
            The Stamp block regularly stamps the canvas with colored shapes. The orientation of the shape is determined by the orientation of the block.
            Users can configure its opacity, and each successive stamp is "on top" of the previous one.
            <br/>
            <b><i>Properties</i></b> :
            <ul>
              <li>Color : What color from the palette is the stamp. Random selects a color among the four colors from the palette. Rotating interpolate the color over time, producing a gradient.</li>
              <li>Size : Size of the stamp. Generally way bigger than the particle spray.</li>
              <li>Pressure : How much pressure is applied to the stamp. The more pressure, the more opaque the stamp is.</li>
              <li>Shape : A selection of shapes for the stamp.</li>
            </ul>
          </Typography>
        </Box>,
        'Wave Mod': 
          <Box component='span'>
            <Typography variant='h6'>
              Wave Mod
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.6'}}>
              <b><i>Type</i></b> : Modificator <SettingsSuggest fontSize='small' sx={{mb:-.6}}/>
              <br/>
              <b><i>Description</i></b> :
              The Wave Mod influences neighbouring blocks based on a pure wave of a given shape.
              It influences its neighbours as follows :<br/>
              <ul>
                <li>Motor : The power of the motor will fluctuate over time according to the wave length, amplitude and phase.</li>
                <li>Particle spray : The size of the particles produced will change over time.</li>
                <li>Brush : The width of the brush will change over time.</li>
                <li>Stamp : The size of the stamp will change over time.</li>
              </ul>
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Wave length : How long is the wave's period.</li>
                <li>Amplitude : The amplitude of the wave. Proportional to the value modified, for instance in case of a brush, maximum amplitude would make the brush's width from 0
                to the width set on the brush block.</li>
                <li>Phase : Offset applied to the wave calculation. Usefull if you want to desynchronize multiple Wave mods.</li>
                <li>Wave shape : The shape of the wave. Sine produces smooth curves, Triangle produces sawtooth patterns, and Square produces sharp changes.</li>
              </ul>
            </Typography>
          </Box>,
        'Rotator Mod': 
          <Box component='span'>
            <Typography variant='h6'>
              Rotator Mod
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.5'}}>
              <b><i>Type</i></b> : Modificator <SettingsSuggest fontSize='small' sx={{mb:-.6}}/>
              <br/>
              <b><i>Description</i></b> :
              The rotator mod periodically rotates the block it is connected to by 90 degrees. 
              It can be set to rotate clockwise or counter-clockwise and you can configure the delay between each rotation. 
              It only has any real influence on the blocks that have a direction.
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Interval : The delay between each rotation.</li>
                <li>Angle : Whether the rotation changes by 90° or 180°.</li>
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
              <b><i>Type</i></b> : Modificator <SettingsSuggest fontSize='small' sx={{mb:-.6}}/>
              <br/>
              <b><i>Description</i></b> :
              The perlin noise influences neighbouring blocks based on a perlin noise, or more precisely on a stack of several simplex noise.
              It produces a smooth noise that looks natural and can be used to create a variety of effects.
              It influences its neighbours as follows :<br/>
              <ul>
                <li>Motor : the direction of the motor will be influenced and try to match the value of the noise according to its position.</li>
                <li>Particle spray : The particules will try to follow directions sampled from the noise and also align themselves accordingly.</li>
                <li>Brush : alters the brush to only appear for certain values of the noise.</li>
                <li>Stamp : alters the brush pressure.</li>
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
          'Switch': 
          <Box component='span'>
            <Typography variant='h6'>
              Switch
            </Typography>
            <Typography component='span' variant='body1' sx={{lineHeight:'1.5'}}>
              <b><i>Type</i></b> : Modificator <SettingsSuggest fontSize='small' sx={{mb:-.6}}/>
              <br/>
              <b><i>Description</i></b> :
              The Switch modificator turns its neighbouring blocks on and off at regular interval.
              <br/>
              <b><i>Properties</i></b> :
              <ul>
                <li>Interval : The delay between toggle.</li>
                <li>Starts on/off : Determines the starting state of the switch.</li>
                <li>Balance : The length of one state compared to the other. if the cursor is centered, on and off have the same duration. Works in conjunction with Interval and Starts off/on</li>
                <li>Combine AND/OR : Defines how multiple switches combines their influences when adjacent to the same block, either logical AND or OR.</li>
              </ul>
            </Typography>
          </Box>,
        
    }

    const constructionBlockDetailsContent = () => {

        const blocks = Module.moduleTypes;

        return blocks.map( (block, index) => {
            return (
              
              <Stack 
                key={index} 
                direction='row' 
                sx={{
                mt:1,mb:1,
                p:2,
                borderRadius:'4px',
                border:'1px dashed white',
                }}>
                  <Box sx={getBoxStyle(block.name)} />
                  {blocksDescriptions[block.name]}
              </Stack>
            )
        })
    }

    const portraitImgBoxStyle = (url:string) => {
      return {
          backgroundImage: `url(${url})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          width: '140px',
          height: '210px',
          display:'inline-block',
          border:'1px dashed white',
          borderRadius:'4px',
      }
  }

  const squareImgBoxStyle = (url:string) => {
    return {
        backgroundImage: `url(${url})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '60px',
        height: '60px',
        display:'inline-block',
        //border:'1px dashed white',
        borderRadius:'4px',
    }
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
                        <li><Link href="#requirements">Requirements</Link></li>
                        <li><Link href="#usage">Usage</Link></li>
                        <li><Link href="#controls">Controls</Link></li>
                        <ul>
                            <li><Link href="#controls-general">General</Link></li>
                            <li><Link href="#controls-topleft">Top left buttons</Link></li>
                            <li><Link href="#controls-arttitle">Artwork title</Link></li>
                            <li><Link href="#controls-modules">Blocks manipulation</Link></li>
                            <li><Link href="#controls-exportsmenu">Exports menu</Link></li>
                        </ul>
                        <li><Link href="#performances">On performances</Link></li>
                        <li><Link href="#tips">Tips</Link></li>
                        <li><Link href="#blocks">Construction blocks reference</Link></li>
                    </ul>
                </Typography>
            </Box>
            <Box id='about' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>About</u>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The Incredible Contraption is a new kind of experience for collectors designed for #fxhackathon2023, enabled by the fx(params) system. 
                    Build one (or several) contraption(s) using the provided blocks and watch them come to life, spreading paint on the canvas,
                    drawing lines and shapes, and creating unique compositions. 
                    <br/>
                    Who said you needed to know how to code to create generative art ? With the Incredible Contraption, you can use many tools frequently seen in
                    generative art, such as noise, particles, physics, and more, without having to write a single line of code, but instead by using a "easy to use, hard to master" set of rules.
                    <br/>

                </Typography>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='requirements' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Requirements</u>
                </Typography>
                <Typography variant="body1" gutterBottom>
                    The experience is first and foremost designed for desktop / laptops, ideally with a mouse. Mobile controls are somewhat workable but not ideal and not recommended.
                    <br/> 
                    The experience can also be quite demanding on the hardware, and requires decent GPU to run smoothly. It also relies heavily on a physics simulation
                    on the CPU, and as such, the experience will run better on a computer with a decent CPU, but slowdowns are expected and not necessarily bad / shouldn't
                    freeze the browser.
                    <br/> 
                    Google Chrome is the recommended browser as it has the best support for the webgl features used in the experience.
                </Typography>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='usage' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Usage</u>
                </Typography>
                <Typography component={'span'} variant="body1" gutterBottom>
                    Place construction blocks on a 7x7 grid to create one or several contraptions. Blocks have a specific function and can be combined to create complex behaviors.
                    Each block is physically simulated and will interact with the other blocks (collision, weight distribution, etc...), but they do not interact with the drawn 
                    elements on the canvas.
                    <br/>
                    Two blocks orthogonally adjacent to each other will be connected and will move as one. There's no diagonal connections.                    
                    <br/><br/>
                    <Stack direction="row" spacing={2}>
                      <Box sx={squareImgBoxStyle('./assets/icons/icon_directional.png')} />
                      <Box>Blocks with this background have a directional effect, and you can rotate them.</Box>
                    </Stack>
                    <br/>
                    <Stack direction="row" spacing={2}>
                      <Box sx={squareImgBoxStyle('./assets/icons/icon_mod.png')} />
                      <Box>Blocks with this background are <SettingsSuggest fontSize='small' sx={{mb:-.6}}/>modifiers  that will influence <b>all four blocks</b> orthogonally adjacent to them.</Box>
                    </Stack>
                    <br/>
                    Details for each block can be found in the <Link href="#blocks">Blocks reference</Link> section.
                    <br/><br/>
                    Use the various blocks, their placement and the adjacency rules to create a drawing contraption that is then physically simulated and will draw on the canvas.
                    You can switch back and force between <DesignServices fontSize='small' sx={{mb:-.6}}/>design mode and <RocketLaunch fontSize='small' sx={{mb:-.6}}/>Simulation mode at any time
                    to iterate over your design and see how it behaves.<br/>
                    The simulation runs for a varying amount of time that depends on the complexity of the contraption, and will stop automatically when it's done.
                    The progress bar at the bottom of the screen will show you the progress of the simulation.
                    The end result is what will appear on the thumbnail on fx(hash).
                    <br/>                    
                    Once you're happy with the result, you can press the mint button in the fx(params) panel to mint your artwork on the blockchain.
                    <br/><br/>
                    You can also customize the colors used by selecting a predefined <Palette fontSize='small' sx={{mb:-.6}}/> palette as well as select the <AspectRatio fontSize='small' sx={{mb:-.6}}/> aspect ratio of the canvas.
                </Typography>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='controls' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Controls</u>
                </Typography>

                <Box id='controls-general' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        General
                    </Typography>
                    <Typography component={'span'} variant="body1" gutterBottom>
                    <ul>
                      <li>Click the left mouse button <Mouse fontSize='small' sx={{mb:-.6}} /> anywhere on the canvas and drag to move the camera.</li>
                      <li>Scroll with the mouse wheel ( or the middle button ) to zoom in <ZoomIn fontSize='small' sx={{mb:-.6}}/> and out .</li>
                    </ul>
                    </Typography>
                </Box>
                <Box id='controls-topleft' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        Top left buttons
                    </Typography>
                    <Typography component={'span'} variant="body1" gutterBottom>
                        <Typography component={'span'} variant="body1" gutterBottom>
                          In design mode :
                        </Typography>
                        <List>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <RocketLaunch color='warning' /> </Avatar>
                            <ListItemText primary="Switch to simulation mode" secondary="" />
                          </ListItem>
                          
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <Palette color='warning' /> </Avatar>
                            <ListItemText primary="Edit palette" secondary="Select among a list a set of 5 colors that will be used by your artwork. One color for the background, and four colors for various drawing elements." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <AspectRatio color='warning' /> </Avatar>
                            <ListItemText primary="Edit aspect ratio" secondary="Select the aspect ratio of your artwork between square, portrait and landscape. As the contraption wraps around the frame and various elements can wrap / collide with it, this is an intergral part of the design." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <CenterFocusStrong color='warning' /> </Avatar>
                            <ListItemText primary="Edit start position" secondary="Where in the frame will your contraption(s) begin its journey. Can drastically change the final result." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <Delete color='warning' /> </Avatar>
                            <ListItemText primary="Delete contraption" secondary="Clear all blocks from the grid." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <PrecisionManufacturing color='warning' /> </Avatar>
                            <ListItemText primary="Generate a random contraption" secondary="Creates a random contraption, and also randomize the palette, aspect ratio and start position. Usefull when you lack inspiration." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <QuestionMark color='warning' /> </Avatar>
                            <ListItemText primary="Help" secondary="This help panel" />
                          </ListItem>
                        </List>
                        <Typography component={'span'} variant="body1" gutterBottom>
                          In Simulation mode :
                        </Typography>
                        <List>
                          <ListItem>
                          <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <DesignServices color='warning' /> </Avatar>
                            <ListItemText primary="Switch to design mode" secondary="" />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <Camera color='warning' /> </Avatar>
                            <ListItemText primary="Exports" secondary="Opens a menu to export PNG captures of the design and the artwork. Detailed below." />
                          </ListItem>
                          <ListItem>
                            <Avatar sizes='small' sx={{ bgcolor: 'primary.main', mr:1 }}> <BlurOn color='warning' /> </Avatar>
                            <ListItemText primary="Adjust anti-aliasing" secondary="Opens a menu to adjust the anti-aliasing level, which can have a dramatic influence on performances." />
                          </ListItem>
                        </List>
                    </Typography>
                </Box>
                <Box id='controls-arttitle' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        Artwork title
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        In the top right if the interface in Design mode, you'll find a editable text field where you can enter a title for your artwork.
                        This title will appear on the blueprint under the iteration number and above the progress bar in Simulation mode.
                        It will also appear in the exports of the blueprint ( but not the artwork ).
                    </Typography>
                </Box>
                <Box id='controls-modules' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                        Blocks manipulation
                    </Typography>
                    <Typography component={'span'} variant="body1" gutterBottom>
                        You build your contraption by placing the various construction blocks on a 7x7 grid. The blocks are available from the bottom drawer. Simply drag
                        them from the drawer and drop them inside the grid. Valid emplacemeents will be highlighted in blue, invalid ones in red. You can also just click
                        on a block in the drawer, then click again on the grid to place it.
                        <br/><br/>
                        <Stack direction="row" spacing={2} sx={{verticalAlign:'middle', justifyContent:'center', alignItems:'center', textAlign:'center' }}>
                          <Box sx={{display:'inline-block',}}>
                              <Stack >
                                <Box sx={portraitImgBoxStyle('./assets/onboarding/step1_goodplacement.jpg')} />
                                <Typography variant='caption' sx={{color:'white'}}>Valid placement</Typography>
                              </Stack>
                          </Box>
                          <Box sx={{display:'inline-block',}}>
                              <Stack >
                                <Box sx={portraitImgBoxStyle('./assets/onboarding/step1_badplacement.jpg')} />
                                <Typography variant='caption' sx={{color:'white'}}>Invalid placements</Typography>
                              </Stack>
                          </Box>
                          <Box component={'span'} sx={{display:'inline-block', textAlign:'left'}}>
                              An emplacement is valid if : 
                              <ul>
                                  <li>It's inside the 7x7 zone delimited by a dashed border</li>
                                  <li>It's not already occupied by another block</li>
                              </ul>
                          </Box>
                      </Stack>
                      <br/>
                      The blocks drawer can be sorted by block category for convinience by clicking the various tabs in the drawer.
                      <br/><br/>
                      If you click on a block already present in the grid, you open a small menu where you can : 
                      <ul>
                        <li><Settings fontSize='small' sx={{mb:-.6}}/> Configure the block : opens a new, more involved menu where you can adjust a selection of the blocks properties. See the <Link href='#blocks'>blocks reference</Link> for more infos.</li>
                        <li><PanTool fontSize='small' sx={{mb:-.6}}/> Mode the block : select this option then place the block in an empty grid emplacement.</li>
                        <li><Sync fontSize='small' sx={{mb:-.6}}/> Rotate the block if it's a directional block : select this option, then one of the four proposed cardinal directions.</li>
                        <li><ContentCopy fontSize='small' sx={{mb:-.6}}/> Duplicate the block and its configuration : select this option, then place the new block generated under your pointer.</li>
                        <li><Delete fontSize='small' sx={{mb:-.6}}/> Delete the block</li>
                      </ul>

                    </Typography>
                </Box>
                <Box id='controls-exportsmenu' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                    <Typography variant="h6" gutterBottom>
                      Exports menu
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Before or after the mint, you can export PNG captures of both your design blueprint and the produced artwork.
                      The exports menu is available from the top right button in Simulation mode by clicking the <Camera fontSize='small' sx={{mb:-.6}}/> button.
                      <br/><br/>
                      In this menu, select a size for your exports in the dropdowns, then press the corresponding export button. You can export both the artwork
                      and the blueprint that generated it. The export will be downloaded to your computer.
                      The larger the resolution, the longer it will take to generate the export, and the larger the file will be.<br/>
                      Warning : the maximum size for the artwork can get very large ( 800 MB ), and the export can take a very long time to generate. Be patient.
                      <br/><br/>
                      N.B. : For the artwork export, what is captured is what has currently been drawn, not necesseraly the same as the thumbnail, which is captured when the simulation
                      is over ( when the progress bar is full ).
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='performances' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>On performances</u>
                </Typography>
                <Typography component={'span'} variant="body1" gutterBottom>
                  The simulation is a  demanding process, and the performances of the app will vary greatly depending on your hardware.
                  <br/>
                  Every block of the design has a physical component, but the <Brush fontSize='small' sx={{mb:-.6}}/>drawing blocks are by far the most demanding.
                  They use both the CPU and the GPU, and the more of them you have, the more demanding the simulation will be.
                  The physics simulation can slow down without too much impact on your browser, but the GPU charge can put your computer on its virtual knees.
                  There's no hard limit ( except for the grid size ) on the number of those blocks, but you don't need that many to get a good result.
                  If you experience performance issues, try reducing the number of drawing blocks in your design.
                  <br/><br/>
                  Another big performance factor is the alpha blending, that is calculating the transparency value for the pixels. The more layers there are, the longer it takes.
                  If your contraption doesn't move much or always paint on the same spot, you'll get large stacks of layers, and the simulation will slow down.
                  <br/><br/>
                  Lastly, in design mode, you can adjust the anti-aliasing. The method used is quite demanding, and you can get some serious performances gains by reducing quality.
                  This quality settings only applies to your browser window, exports are always max quality.
                  <br/><br/>
                </Typography>
            </Box>
            <Divider sx={{ ml:'25%', mr:'25%', mb:2}} variant='middle'/>
            <Box id='tips' sx={{ p: 1, textAlign:'justify', textJustify:'inter-word' }}>
                <Typography variant="h5" gutterBottom>
                    <u>Tips</u>
                </Typography>
                <Typography component={'span'} variant="body1" gutterBottom>
                    Tips & tricks to get the most out of the experience :
                    <ul>
                      <li>You don't have to connect all your blocks. Each group of connected blocks will behave independently.</li>
                      <li>Each drawing element can fill the screen with paint. Use them sparingly.</li>
                      <li><SettingsSuggest fontSize='small' sx={{mb:-.6}}/> Modificator blocks have interesting effects and you can combine their effect on a block. Their influence is usually averaged.</li>
                    </ul>
                </Typography>
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