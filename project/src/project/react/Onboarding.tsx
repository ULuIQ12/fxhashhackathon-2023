import { ArrowBack, ArrowForward, ArrowForwardOutlined, ArrowRight, AspectRatio, Brush, Build, CheckBoxOutlineBlank, CropSquare, Delete, DesignServices, Done, Mouse, OpenWith, Palette, PanTool, PrecisionManufacturing, RocketLaunch, Settings, Sync, ZoomIn } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Step, StepButton, StepLabel, Stepper, Typography } from '@mui/material';
import * as React from 'react';

const steps = ['Welcome', 'How to build', 'Edit blocks', 'Test'];

/**
 * Little onboarding tutorial that appears when the app is first opened in minting mode
 * @param props 
 * @returns 
 */
export default function Onboarding(props) {

    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set<number>());

    const isStepOptional = (step: number) => {
        return true;
    };

    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {

       props.onClose();
    };

    const handleFinish = () => {
        //setActiveStep(0);
        props.onClose();
    };

    const stepBoxStyle = {
        mt: 2, mb: 3 , p:2,
        border:'1px dashed white',
        borderRadius:'4px',
    }

    const squareImgBoxStyle = (url:string) => {
        return {
            backgroundImage: `url(${url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '140px',
            height: '140px',
            display:'inline-block',
            border:'1px dashed white',
            borderRadius:'4px',
        }
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

    const lSquareImgBoxStyle = (url:string) => {
        return {
            backgroundImage: `url(${url})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '210px',
            height: '210px',
            display:'inline-block',
            border:'1px dashed white',
            borderRadius:'4px',
        }
    }

    const blockIcon = () => {
        return (
        <CropSquare fontSize='small' sx={{mb:-.8}}/>
        )
    }



    const getStepContent = () => 
    {
        if( activeStep === 0 )
        {
            return (
                <Box sx={stepBoxStyle}>
                    Welcome to The Incredible Contraption!<br/><br/>
                    <Box
                    sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                        Design an autonomous contraption that will create your unique artwork. 
                        Use construction blocks{blockIcon()} to create a contraption that will move around the canvas and paint your artwork.
                        Play around with the different blocks{blockIcon()}, their properties and their placement to express yourself in <b>your own unique way</b>.
                    </Box>
                    <br/>
                    <Stack direction="row" sx={{verticalAlign:'middle', justifyContent:'center', alignItems:'center' }}>
                        <Box sx={squareImgBoxStyle('./assets/onboarding/step0_contraption.jpg')} />
                        <ArrowForwardOutlined fontSize='large' sx={{ml:4, mr:4}}/>
                        <Box sx={squareImgBoxStyle('./assets/onboarding/step0_art.jpg')} />
                    </Stack>
                    <br/>
                    <Box
                    sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                    At any point, you can click and drag <PanTool fontSize='small' sx={{mb:-.8}}/> to move around the canvas with the left mouse button <Mouse fontSize='small' sx={{mb:-.8}}/>.
                    You can zoom in and out <ZoomIn fontSize='small' sx={{mb:-.8}}/> with the mouse wheel.
                    <br/>
                    You can collapse the fx(params) menu on the left, it won't be used until you're ready to mint your contraption / artwork.
                    </Box>
                </Box>
            );
        }
        else if( activeStep === 1 )
        {
            return (
                <Box sx={stepBoxStyle}>
                    
                    <Box
                    sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                        You build your contraption by placing blocks{blockIcon()} on a grid.
                        To do so you can either click on the block{blockIcon()} in the bottom drawer and then click on a grid emplacement to place it, 
                        or you can simply click and drag the block{blockIcon()}.
                        Valid placement locations will be highlighted in blue, bad placement in red.
                    </Box>
                    <br/>
                    <Stack direction="row" spacing={2} sx={{verticalAlign:'middle', justifyContent:'center', alignItems:'center' }}>
                    <Box sx={{display:'inline-block',}}>
                        <Stack sx={{ml:4}}>
                        <Box sx={portraitImgBoxStyle('./assets/onboarding/step1_goodplacement.jpg')} />
                        <Typography variant='caption' sx={{color:'white'}}>Valid placement</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{display:'inline-block',}}>
                        <Stack sx={{mr:4}}>
                        <Box sx={portraitImgBoxStyle('./assets/onboarding/step1_badplacement.jpg')} />
                        <Typography variant='caption' sx={{color:'white'}}>Invalid placements</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{display:'inline-block',}}>
                        An emplacement is valid if : 
                        <ul>
                            <li>It's inside the 7x7 zone delimited by a dashed border</li>
                            <li>It's not already occupied by another block{blockIcon()}</li>
                        </ul>
                    </Box>
                    </Stack>
                    <br/>
                    <Box
                        sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                        Blocks{blockIcon()} come in three main categories: Structural, Drawing and Mods. 
                        Structural blocks <Build fontSize='small' sx={{mb:-.8}}/> influence the movement of the contraption, Drawing blocks <Brush fontSize='small' sx={{mb:-.8}}/> draw / spray colors around and Mods blocks <OpenWith fontSize='small' sx={{mb:-.8}}/> modify the behaviour of neighbouring blocks.
                        <br/>
                        Two blocks{blockIcon()} orthogonally adjacent to each other will be connected and move as one.
                    </Box>
                </Box>
            );
        }
        else if( activeStep === 2 )
        {
            return (
                <Box sx={stepBoxStyle}>
                    <Box
                        sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                        Click a block in your design to open a small contextual menu allowing you to <PanTool fontSize='small' sx={{mb:-.8}}/> move the block, <Delete fontSize='small' sx={{mb:-.8}}/> delete it, <Settings fontSize='small' sx={{mb:-.8}}/> configure its properties and <Sync fontSize='small' sx={{mb:-.8}}/> rotate it if applicable.
                        <br/>
                        The configure button <Settings fontSize='small' sx={{mb:-.8}}/> will open a more involved menu allowing you to change some properties of the block.
                    </Box>
                    <br/>
                    <Stack direction="row" spacing={8} sx={{verticalAlign:'middle', justifyContent:'center', alignItems:'center' }}>
                    <Box sx={{display:'inline-block',}}>
                        <Stack sx={{ml:4}}>
                        <Box sx={lSquareImgBoxStyle('./assets/onboarding/step2_contextual.jpg')} />
                        <Typography variant='caption' sx={{color:'white'}}>Contextual menu</Typography>
                        </Stack>
                    </Box>
                    <Box sx={{display:'inline-block',}}>
                        <Stack sx={{mr:4}}>
                        <Box sx={lSquareImgBoxStyle('./assets/onboarding/step2_configure.jpg')} />
                        <Typography variant='caption' sx={{color:'white'}}>Configuration menu</Typography>
                        </Stack>
                    </Box>
                    </Stack>
                </Box>
            );
        }
        else if( activeStep === 3 )
        {
            return (
                <Box sx={stepBoxStyle}>
                    <Box
                        sx={{ textAlign:'justify', textJustify:'inter-word'}}>
                        To test your design and see what artwork it produces, simply click the top left button <RocketLaunch fontSize='small' sx={{mb:-.8}}/> to enter simulation mode.
                        The progress bar at the bottom of the screen will fill up as the contraption is simulated. 
                        Once it's full, the simulation is over and you can see the result that will be displayed as the artwork thumbnail.
                        <br/>
                        Iterate over your design by going back and forth between the design<DesignServices fontSize='small' sx={{mb:-.8}}/> and simulation<RocketLaunch fontSize='small' sx={{mb:-.8}}/> modes.
                        <br/><br/>
                        In design mode, you can also : 
                        <ul>
                            <li>Change the palette used for the artwork by clicking the palette button <Palette fontSize='small' sx={{mb:-.8}}/> in the top left corner.</li>
                            <li>Choose the aspect ratio of the artwork by clicking the aspect ratio button <AspectRatio fontSize='small' sx={{mb:-.8}}/></li>
                        </ul>
                        
                        If you lack inspiration, you can always try to generate a random contraption by clicking the <PrecisionManufacturing fontSize='small' sx={{mb:-.8}}/> button, also in the top left corner.
                        <br/><br/>
                        <Box sx={{textAlign:'center' }}>
                            <Typography variant='h6' sx={{color:'white'}}>
                                Experiment, iterate, have fun !
                            </Typography>
                        </Box>
                        
                    </Box>
                    <br/>
 
                </Box>
            );
        }
    }

    const getStepper = () => {
        return (
            <Stepper activeStep={activeStep} >
                {steps.map((label, index) => {
                const stepProps: { completed?: boolean } = {};
                const labelProps: {
                    optional?: React.ReactNode;
                } = {};
                
                if (isStepSkipped(index)) {
                    stepProps.completed = false;
                }
                return (
                    <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                );
                })}
            </Stepper>
        )
    }


    return (
        <Dialog 
            sx={{pointerEvents:'all'}}
            PaperProps={{sx:{
                borderRadius:'4px',
                border:'1px dashed white',
                boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
            }}}
            open={props.open} 
            aria-labelledby="onboarding" 
            aria-describedby="onboarding" 
            fullWidth={true}
            maxWidth="md">
            <DialogTitle sx={{fontFamily:'CabinSketch' , pt:2, pb:0}} variant='h5' id="onboarding">The Incredible Contraption</DialogTitle>
            <DialogContent>
            
                    {getStepContent()}
                    {getStepper()}
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                        <Button
                        color="inherit"
                        variant="outlined"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<ArrowBack sx={{mb:0.15}} />}
                        sx={{ mr: 1 }}
                        >
                        Back
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        {isStepOptional(activeStep) && (
                        <Button  variant="outlined" color="secondary" onClick={handleSkip} sx={{ mr: 1 }}>
                            Skip tutorial
                        </Button>
                        )}
                        <Button 
                            variant="outlined" color="primary" 
                            endIcon={((activeStep !== steps.length-1)?<ArrowForward sx={{mb:0.15}} />:<Done/>)}
                            onClick={((activeStep !== steps.length-1)?handleNext:handleFinish)}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </Button>
                    </Box>

            </DialogContent>
        </Dialog>
    )
}