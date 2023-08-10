import * as React from 'react';
import { Menu, Zoom, Box, useTheme } from '@mui/material';
import { Designer, RunAR } from '../Designer';
import {Vector2} from 'three';

export default function EditStartPos( props ) {

    const theme = useTheme();

    const [sizeX, setSizeX] = React.useState(0);
    const [sizeY, setSizeY] = React.useState(0);
    const [px, setPX] = React.useState(0);
    const [py, setPY] = React.useState(0);

    const cursorSize:number = 24;


    const currentSize = React.useRef( new Vector2() );
    const currentPos = React.useRef( new Vector2() );

    React.useEffect(() => {

        const ar:RunAR = Designer.instance.currentAR;
        const size:Vector2 = currentSize.current;
        switch( ar )
        {
            default:
            case RunAR.Square:
                size.set( 170, 170);
                break;
            case RunAR.Portrait:
                size.set( 134, 200);
                break;
            case RunAR.Landscape:
                size.set( 200, 134);
                break;

        }
        currentSize.current = size;
        setSizeX( size.x);
        setSizeY( size.y);

        const normPos:Vector2 = Designer.instance.launchPosition;
        const scaled:Vector2 = scaleNormalizedPos( normPos );
        setPX( scaled.x );
        setPY( scaled.y );

    }, [props.open]);
        

    // crosshair shaped cursor SVG
    const cursor = () => {
        return (
            <Box sx={{
                position:'absolute',
                transform: 'translate(-50%, -50%)',
                left:px,
                top:py,
                pointerEvents:'none',
            }}>
                <svg width={cursorSize} height={cursorSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>

            </Box>
        )
    }

    

    const handlePointerDown = (event) => {
        const menuElement:HTMLElement = document.getElementById("edit-start-pos");
        if( event.target == menuElement )
        {
            const cpos:Vector2 = GetPointerPos(event, currentPos.current);
            setPX( cpos.x );
            setPY( cpos.y );
        }
    }

    const handlePointerMove = (event) => {
        
        if( event.buttons == 1 )
        {
            const cpos:Vector2 = GetPointerPos(event, currentPos.current);
            setPX( cpos.x );
            setPY( cpos.y );
        }
    }

    function GetPointerPos(event, target?:Vector2):Vector2
    {
        if( target == null )
            target = new Vector2();
        let rect:DOMRect;
        const menuElement:HTMLElement = document.getElementById("edit-start-pos");
        rect = menuElement.getBoundingClientRect();
        
        const x:number = Math.min(Math.max( cursorSize,event.clientX - rect.left), sizeX - cursorSize);
        const y:number = Math.min(Math.max( cursorSize ,event.clientY - rect.top), sizeY - cursorSize );
        target.set( x, y );
        
        return target;
    }

    function normalizePos( pos:Vector2 ):Vector2
    {
        const size:Vector2 = currentSize.current;
        const x:number = pos.x / size.x - .5;
        const y:number = (pos.y / size.y - .5)*-1;
        
        return new Vector2( x, y );
    }

    function scaleNormalizedPos( pos:Vector2 ):Vector2
    {
        const size:Vector2 = currentSize.current;
        const x:number = ( pos.x + .5 ) * size.x;
        const y:number = ( (pos.y*-1) + .5 ) * size.y;
        console.log( pos, size, x, y );
        return new Vector2( x, y );
    }

    const handlePointerUp = (event) => {
        Designer.instance.updateLaunchPos(normalizePos( currentPos.current ) );

        
    }


    return (
        <Menu 
            
            anchorEl={props.anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            open={props.open}
            onClose={props.onClose}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            PaperProps={{
                id:'edit-start-pos',
                sx:{
                    pointerEvents:'all',
                    overflow:'hidden',
                    width:sizeX + 'px',
                    height:sizeY + 'px',
                    marginLeft:2,
                    borderRadius:'4px',
                    border:'1px dashed white',
                    boxShadow:'inset 0px 0px 50px 0px rgba(0,0,0,0.25)'
                },
            }}
        >
            {cursor()}
        </Menu>
    );

}