import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Apps, Architecture, Brush, DashboardCustomize, SettingsSuggest } from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import { AppBar, Stack, Tab, Tabs, useTheme,Typography  } from '@mui/material';
import BlockItem from './BlockItem';
import { Module, ModuleType } from '../machine/structs/Module';
import { useHorizontalScroll } from './UseHorizontalScroll';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function BlockDrawer() {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: true,
    right: false,
  });

  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);

  const moduleTypes = Module.moduleTypes;

  const toggleDrawer =
    (anchor: Anchor, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setState({ ...state, [anchor]: open });
    };

    const onChildDragStart= () => {
        //setState({ ...state, ["bottom"]: false });
    }

    const blockItems = moduleTypes.map((moduleType) =>(
        <BlockItem 
          key={moduleType.id} 
          data={moduleType} 
          dragStartCallback={onChildDragStart}
        />
    ));

  const scrollRef = useHorizontalScroll();
  const list = (type:string) => {

    let blocks:JSX.Element[] = [];
    if( type == "all")
    {
      blocks = moduleTypes.map((moduleType) =>(
        <BlockItem 
          key={moduleType.id} 
          data={moduleType} 
          dragStartCallback={onChildDragStart}
        />
      ));
    }
    else if( type == "struct")
    {
      blocks = moduleTypes.map((moduleType) => { 
        if( moduleType.name == ModuleType.Block || moduleType.name == ModuleType.Motor || moduleType.name == ModuleType.Rocket) 
        return (
        <BlockItem 
          key={moduleType.id} 
          data={moduleType} 
          dragStartCallback={onChildDragStart}
        />
      )});
    }
    else if( type == "draw")
    {
      blocks = moduleTypes.map((moduleType) => { 
        if( moduleType.name == ModuleType.Party || moduleType.name == ModuleType.Spray ) 
        return (
        <BlockItem 
          key={moduleType.id} 
          data={moduleType} 
          dragStartCallback={onChildDragStart}
        />
      )});
    }
    else  if( type == "mod")
    {
      blocks = moduleTypes.map((moduleType) => { 
        if( moduleType.name == ModuleType.WaveMod || moduleType.name == ModuleType.Rotator || moduleType.name == ModuleType.Perlin || moduleType.name == ModuleType.Switch ) 
        return (
        <BlockItem 
          key={moduleType.id} 
          data={moduleType} 
          dragStartCallback={onChildDragStart}
        />
      )});
    }

    return (
      <Box
        component='span'
        sx={{
          width: 'auto',
          padding: '1em',
          display: 'flex',
          alignItems: 'left',
          justifyContent: 'center',        
          overflow:'auto',
          }}
        
        role="presentation"
        //onClick={toggleDrawer(anchor, false)}
        //onKeyDown={toggleDrawer(anchor, false)}
      >
        
          <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
              {blocks}
          </Stack>
      </Box>
    ) 
  }

  interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
    
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 0 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  const handleChangeIndex = (index: number) => {
    setTabValue(index);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const tabStyle = {
    pt:0, 
    pb:0,
    mt:-1.5, 
    mb:-2,
    
  }
  

  return (
    <Box
        sx={{
          bgcolor:'#0f477f',
          borderTop: '1px dashed #FFFFFF',
          transition:'none',
          boxShadow:'inset 0px 0px 30px 0px rgba(0,0,0,0.25)'
        }}
        className="blockDrawer">

      { /* <AppBar position="static"> */ }
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="secondary"
          textColor="inherit"
          sx={{ p:0}}
          centered

        >
          <Tab sx={tabStyle} icon={<Apps />} iconPosition="start" label="All" />
          <Tab sx={tabStyle} icon={<Architecture />} iconPosition="start" label="Structural" />
          <Tab sx={tabStyle} icon={<Brush />} iconPosition="start" label="Drawing" />
          <Tab sx={tabStyle} icon={<SettingsSuggest />} iconPosition="start" label="Mods" />
        </Tabs>
        { /* </AppBar> */ }
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={tabValue}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={tabValue} index={0} dir={theme.direction}>
          {list("all")}
        </TabPanel>
        <TabPanel value={tabValue} index={1} dir={theme.direction}>
          {list("struct")}
        </TabPanel>
        <TabPanel value={tabValue} index={2} dir={theme.direction}>
          {list("draw")}
        </TabPanel>
        <TabPanel value={tabValue} index={3} dir={theme.direction}>
          {list("mod")}
        </TabPanel>
      </SwipeableViews>
        

    </Box>
  );
}