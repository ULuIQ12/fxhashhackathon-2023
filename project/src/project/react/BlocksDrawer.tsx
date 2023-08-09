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
import { DashboardCustomize } from '@mui/icons-material';
import { Stack } from '@mui/material';
import BlockItem from './BlockItem';
import { Module } from '../machine/structs/Module';
import { useHorizontalScroll } from './UseHorizontalScroll';

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export default function BlockDrawer() {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: true,
    right: false,
  });

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
  const list = (anchor: Anchor) => (
    <Box
      sx={{
        width: 'auto',
        padding: '1em',
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'center',        
        overflow:'auto',
        }}
      ref={scrollRef}
      role="presentation"
      //onClick={toggleDrawer(anchor, false)}
      //onKeyDown={toggleDrawer(anchor, false)}
    >
        <Stack direction="row" spacing={2} sx={{ minWidth: 0 }}>
            {blockItems}
        </Stack>
    </Box>
  );

  

  return (
    <Box
        sx={{
          bgcolor:'#0f477f',
          borderTop: '1px dashed #FFFFFF',
          transition:'none',
          boxShadow:'inset 0px 0px 30px 0px rgba(0,0,0,0.25)'
        }}
        className="blockDrawer">

        {list("bottom")}

    </Box>
  );
}