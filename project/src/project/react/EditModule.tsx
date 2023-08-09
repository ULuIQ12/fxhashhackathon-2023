import * as React from 'react';
import Modal from '@mui/material/Modal';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Fade, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Slider, Switch, Typography } from '@mui/material';
import { BoolConfigParam, ColorMode, ConfigParam, FloatConfigParam, ModConfig, Module, SelectConfigParam, WaveConfig, WaveShape } from '../machine/structs/Module';
import { Designer } from '../Designer';
import { Palette } from '../machine/Palette';
import { Build, CancelOutlined, SaveAlt, SaveAltOutlined, SaveOutlined, Shuffle } from '@mui/icons-material';


/**
 * Module edition menu. Appears when selecting "Edit" from the module menu.
 * Contains inputs for all exposed parameters of the module.
 * @param props 
 * @returns 
 */
export default function EditModule( props ) {

    //const moduleData:Module = props.data;
    const moduleData:any = React.useRef(props.data);
    //const configCopy:ModConfig = {...moduleData.config};


    //const [configCopy, setConfigCopy] = React.useState({...props.data.config});
    const [configCopy, setConfigCopy] = React.useState(null);

    React.useEffect(() => {

        moduleData.current = props.data;
        setConfigCopy({...props.data.config});
    }, [props.data]);

    const handleSave = () => 
    {
        // copy the config back to the module
        
        for (const key in configCopy)       
        {
            //moduleData.current.config[key] = configCopy[key];
            props.data.config[key] = configCopy[key];
        }
        
        //console.log( "Config = " , moduleData.config)
        Designer.OnModulesChanged();
        props.onClose();
    }

    const marks = [
        { value: 0, label: 'Minimum'},
        { value: 1, label: 'Very low'},
        { value: 2, label: 'Low'},
        { value: 3, label: 'Medium low'},
        { value: 4, label: 'Medium'},
        { value: 5, label: 'Medium high'},
        { value: 6, label: 'Fairly high'},
        { value: 7, label: 'High'},
        { value: 8, label: 'Very high'},
        { value: 9, label: 'Max'},
        
       
    ];

    function valueToLabel(value:number):string
    {
        return marks[value].label;
    }
    

    const floatSlider = (key:string, config:ModConfig) =>
    {
        const p:FloatConfigParam = config[key] as FloatConfigParam;
        //const min:number = p.options.min;
        //const max:number = p.options.max;
        const min:number = 0;
        const max:number = 9;
        //const step:number = (max - min) / 10;
        const step:number = 1 ;
        const dval:number = Number(p.value) || 0;


        return (
            <ListItem key={key}>
                <ListItemText primary={p.name} secondary={p.desc}/>
                <Slider
                    sx={{ width: 150, minWidth: 150}}
                    //defaultValue={dval}
                    value={dval}
                    aria-label="medium-slider"
                    valueLabelDisplay="auto"
                    size="medium"
                    //marks={marks}
                    valueLabelFormat={valueToLabel}
                    step={step}
                    min={min}
                    max={max} 
                                      
                    onChange={(event, value) => {
                        config[key].value = value as number;
                        setConfigCopy({...configCopy});
                    }}
                />
            </ListItem>
        );
    }

    const boolSwitch = (key:string, config:ModConfig) =>
    {
        const p:BoolConfigParam = config[key] as BoolConfigParam;
        return (
            <ListItem key={key}>
                <ListItemText primary={p.name} secondary={p.desc}/>
                <Switch
                    //defaultChecked={config[key].value}
                    checked={config[key].value}
                    onChange={(event, value) => {
                        config[key].value = value as boolean;
                        setConfigCopy({...configCopy});
                    }}
                />
            </ListItem>
        );
    }

    const onWaveOptionSelect = (event, child) =>
    {
        configCopy["waveshape"].value = child.props.value;
        setConfigCopy({...configCopy});
    }

    const waveOptionSelect = (key:string, config:ModConfig) =>
    {
        const p:SelectConfigParam = config[key] as SelectConfigParam;
        
        return (
            <ListItem key={key}>
                <ListItemText primary={p.name} secondary={p.desc}/>

                <Select
                    sx={{ width: 150, minWidth: 150}}
                    labelId="param-select-label"
                    id="param-select"
                    //defaultValue={p.value || p.default}
                    value={p.value || p.default}                    
                    onChange={onWaveOptionSelect}
                >
                    {
                        p.options.map( (item, index) => {
                            return (
                                <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                            );
                        })
                    }
                </Select>               
            </ListItem>
            
           
        );
    }

    const onRibbonColorOptionSelect = (event, child) =>
    {
        configCopy["color"].value = child.props.value;
        setConfigCopy({...configCopy});
    }

    const ribbonColorOptionSelect = (key:string, config:ModConfig) =>
    {
        const p:SelectConfigParam = config[key] as SelectConfigParam;

        const colors:string[] = [];
        for( const key in ColorMode)
        {
            if(key=="Random" || key == "Rotating" )
            {
                colors.push( "#FFFFFF");
            }
            else 
            {
                const index:number = parseInt( (key.substring(key.length-1, key.length) as string) ) -1;
                
                colors.push("#" + Palette.colors[index].getHexString());
            }
        }
        return (
            <ListItem key={key}>
                <ListItemText primary={p.name} secondary={p.desc}/>

                <Select
                    sx={{ width: 150, minWidth: 150}}
                    labelId="param-select-label"
                    id="param-select"
                    //defaultValue={p.value || p.default}
                    value={p.value || p.default}                    
                    onChange={onRibbonColorOptionSelect}
                >
                    {
                        p.options.map( (item, index) => {
                            if( colors[index] == '#FFFFFF')
                            {
                                return (
                                    <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                                );
                            }
                            else 
                            {
                                return (
                                    <MenuItem key={index} value={item.value}><Box sx={{ 
                                        width: 100, 
                                        height: 24, 
                                        borderRadius:2,
                                        bgcolor:colors[index]
                                    }}> </Box></MenuItem>
                                );
                            }
                        })
                    }
                </Select>               
            </ListItem>
            
           
        );
    }

    const onShapeOptionSelect = (event, child) =>
    {
        configCopy["shape"].value = child.props.value;
        setConfigCopy({...configCopy});
    }

    const shapeOptionSelect = (key:string, config:ModConfig) =>
    {
        const p:SelectConfigParam = config[key] as SelectConfigParam;
        
        return (
            <ListItem key={key}>
                <ListItemText primary={p.name} secondary={p.desc}/>

                <Select
                    sx={{ width: 150, minWidth: 150}}
                    labelId="param-select-label"
                    id="param-select"
                    //defaultValue={p.value || p.default}
                    value={p.value || p.default}                    
                    onChange={onShapeOptionSelect}
                >
                    {
                        p.options.map( (item, index) => {
                            return (
                                <MenuItem key={index} value={item.value}>{item.name}</MenuItem>
                            );
                        })
                    }
                </Select>               
            </ListItem>
            
           
        );
    }
    
    const handleRandomize = () =>
    {
        
        console.log( "Randomize");
        //const config = configCopy;
        //const config = configRef.current;
        for (const key in configCopy)
        {
            const p:ConfigParam = configCopy[key] as ConfigParam;
            if(p.type === "number" && p.exposed )
            {
                configCopy[key].value = Math.floor( Math.random() * 10 );
            }
            else if(p.type ==="boolean" && p.exposed )
            {
                configCopy[key].value = Math.random() > 0.5;
            }
            else if( p.type == "select" && p.exposed)
            {
                const option = configCopy[key].options[Math.floor(Math.random() * configCopy[key].options.length)];
                configCopy[key].value =  option.value;
            }
        }
        setConfigCopy({...configCopy});
        
    }

    const menuItems = () => 
    {
        /*
        if( !props.open)
            return null;
        */
        let items = [];
        const config = configCopy;
        //const config = configRef.current;
        
        //console.log( "menuItems")
        
        let index:number = 0;
        for (const key in config)
        {
            const p:ConfigParam = config[key] as ConfigParam;

            if(p.type === "number" && p.exposed )
            {
                items.push( floatSlider(key, config ) );
            }
            else if(p.type ==="boolean" && p.exposed )
            {
                items.push( boolSwitch(key, config) );
            }
            else if( p.type == "select" && p.exposed)
            {
                if( key === "waveshape")
                    items.push( waveOptionSelect(key, config) );                
                else if( key === "shape")
                    items.push( shapeOptionSelect(key, config) );
                else if( key === "color")
                    items.push( ribbonColorOptionSelect(key, config) );
            }
   
            index++;
        }
        return items;
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
             <DialogTitle sx={{textAlign:'left' , ml:'45px'}}><Build sx={{
                position:'absolute',
                top:'20px',
                left:'20px',
             }}/> Configure {props.data.type}</DialogTitle>
             <DialogContent dividers>
             <List>
                {menuItems()}
             </List>
             </DialogContent>
             <DialogActions>
                <Button variant='outlined' color="secondary" endIcon={<Shuffle sx={{mb:0.15}} />} onClick={handleRandomize}>Randomize</Button>
                <Button variant='outlined' color="secondary" endIcon={<CancelOutlined sx={{mb:0.15}} />} onClick={props.onClose}>Cancel</Button>
                <Button variant='outlined' onClick={handleSave} endIcon={<SaveAlt sx={{mb:0.15}} />}>Commit</Button>
             </DialogActions>
        </Dialog>
        
    );

}