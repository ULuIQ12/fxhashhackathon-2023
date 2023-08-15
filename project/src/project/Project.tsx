import { FXContext, FXSnippet } from "../helpers/FXSnippet";
import { Params, UpdateType } from "../helpers/Params";
import { Features } from "../helpers/Features";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Clock, MathUtils, ColorManagement, MOUSE, OrthographicCamera, PerspectiveCamera, SRGBColorSpace, Scene, TOUCH, Vector2, Vector3, WebGLRenderer } from "three";
import {SSAARenderPass} from 'three/examples/jsm/postprocessing/SSAARenderPass'
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import AppTheme from "./react/AppTheme";
import MachineApp from "./react/App";
import { Designer, RunAR } from "./Designer";
import { Rand } from "../helpers/Rand";
import { PNGRGBAWriter } from '../3rdparty/dekapng';
import { Execute } from "./machine/Execute";
import { onCaptureEnd, onCaptureStart} from "./react/RunUI";
import { updateProgress} from "./react/CaptureModal";
import { DOMElement } from "react";
import { MyFilmPass } from "./post/MyFilmPass";
import JSONCrush from "jsoncrush";
import { FlareSharp } from "@mui/icons-material";




declare var $fx: any;
class  Project
{
    static SUPER_SECRET_CHEAT_CODE:string = "pouet";
    static SUPER_SECRET_CHEAT_MODE_ENABLED:boolean = false;
    
    static PROJECT_NAME:string = "The Incredible Contraption";
    static DEFAULT_BG_COLOR:string = "#242424";
    static instance:Project;

    snippet:FXSnippet;
    gui:GUI;
    guiContent:Object;
    aspect:number = 1;
    capturing:boolean = false;
    capturingBP:boolean = false;
    captureResolution:Vector2[][] = [
        [new Vector2(1080,1080), new Vector2(1440,1440), new Vector2(2160,2160), new Vector2(2880,2880), new Vector2(4320,4320), new Vector2(5760,5760), new Vector2(8640,8640), new Vector2(11520,11520)],
        [new Vector2(1080,1620), new Vector2(1440,2160), new Vector2(2160,3240), new Vector2(2880,4320), new Vector2(4320,6480), new Vector2(5760,8640), new Vector2(8640,12960), new Vector2(11520,17280)],
        [new Vector2(1620,1080), new Vector2(2160,1440), new Vector2(3240,2160), new Vector2(4320,2880), new Vector2(6480,4320), new Vector2(8640,5760), new Vector2(12960,8640), new Vector2(17280,11520)],
    ];

    blueprintResolution:Vector2[] = [
        new Vector2(1080,1080),
        new Vector2(2048,2048),
        new Vector2(4096,4096),
    ];

    previewResolutions:Vector2[] = [
        new Vector2(1200,1200),
        new Vector2(1080,1620),
        new Vector2(1620,1080),
    ]

    constructor(snippet:FXSnippet)
    {
        
        Project.instance = this;
        this.snippet = snippet;
        Project.ResetRand();
        
        this.initParamsAndFeatures();
        this.initDOM();
        this.initAssetsLoading();

    }

    static ResetRand()
    {   
        $fx.randminter.reset(); // argh TS!
        Rand.Init($fx.randminter, $fx.rand);
    }

    static GetContext():string 
    {
        return Project.instance.snippet.context;
    }

    private initParamsAndFeatures()
    {
        Params.setSnippet( this.snippet);
        this.defineParams(); 
        this.defineFeatures();        
    }

    static CONFIG_PARAM_ID:string = "config";
    static PALETTE_PARAM_ID:string = "palette";
    static AR_PARAM_ID:string = "ar";
    static TITLE_MAX_LENGTH:number = 32;
    static TITLE_PARAM_ID:string = "title";
    static SX_PARAM_ID:string = "sx"; // start position x
    static SY_PARAM_ID:string = "sy"; // start position y
    defineParams() 
    {
        Params.addString(Project.CONFIG_PARAM_ID, "Config", UpdateType.CODE_DRIVEN, "", 0, 512);
        Params.addInt(Project.PALETTE_PARAM_ID, "Palette", UpdateType.CODE_DRIVEN, 0, 99, BigInt(0) );
        Params.addInt(Project.AR_PARAM_ID, "Aspect", UpdateType.CODE_DRIVEN, Object.values(RunAR).indexOf(RunAR.Square), Object.values(RunAR).length-1, BigInt(0) );
        Params.addString(Project.TITLE_PARAM_ID, "Title", UpdateType.CODE_DRIVEN, "", 0, Project.TITLE_MAX_LENGTH);
        Params.addFloat(Project.SX_PARAM_ID, "sx", UpdateType.CODE_DRIVEN, -.5,.5, 0.01, 0); 
        Params.addFloat(Project.SY_PARAM_ID, "sy", UpdateType.CODE_DRIVEN, -.5,.5, 0.01, 0);


        //Params.addString("test", "Test", UpdateType.SYNC, "", 0, 32);

        this.snippet.on(Params.UPDATE_SIGNAL,()=>{},this.onParamsChange);  
        
        
        this.snippet.params(Params.params);
    }

    onParamsChange(event)
    {
        console.log("OnParamsChange ->", event);
    }

    defineFeatures() 
    {        
        // features extraction extraction, can't wait after loading to do that
        const crushed:string = Params.getParam(Project.CONFIG_PARAM_ID);
        if( crushed.length > 512 )
        {
            // we have a problem, should not happen, but hard to be sure. 512 feels large enough
            console.log( "Crushed config : ", crushed, this.snippet );
        }

        let weight:number = 0 ;
        let numBlocks:number = 0;
        if( crushed == undefined || crushed == "")
        {
            console.log( "No modules to deserialize");
        }
        else 
        {
            const uncrushed:string = JSONCrush.uncrush(decodeURIComponent(crushed));
            const data:any[] = JSON.parse(uncrushed);
            console.log( data ) ; 
            
            for( let i = 0; i < data.length; i++)
            {
                const d:any = data[i];
                if( d.c != undefined)
                {
                    weight +=  d.c[0]*1/9 * 5;
                    numBlocks++;
                }
            }
        }

        Features.addFeature("Weight", weight.toFixed(1) + " kg");
        Features.addFeature("Blocks used", numBlocks);
        this.snippet.features(Features.feats);
    }

    initAssetsLoading()
    {
        this.loadAssets();
    }
    
    RAPIER; // had weird issues with the display of params & features if this was used as a "regular" import, so I'm using this instead. 
    // Maybe it was a REACT thing?, maybe WebAssembly loading? Maybe Webpack even. Made other modifications too, might not have anything to do with Rapier, 

    async loadAssets()
    {
        const font = new FontFace("CabinSketch", 'url(./fonts/CabinSketch-Bold.ttf)');
        await font.load();        
        document.fonts.add(font);

        const font2 = new FontFace("Material+Icons", 'url(./fonts/MaterialIcons-Regular.ttf)');
        await font2.load();        
        document.fonts.add(font2);

        const font3 = new FontFace("EduSABeginner", 'url(./fonts/EduSABeginner-VariableFont_wght.ttf)');
        await font3.load();        
        document.fonts.add(font3);
        
        document.body.classList.add('fonts-loaded');

        await import('@dimforge/rapier2d').then(RAPIER => {
            this.RAPIER = RAPIER;
        });

        this.onAssetsLoaded();
    }

    onAssetsLoaded()
    {
        this.init();
    }

    init()
    {
        //this.initDOM();
        this.initRenderer();
        this.initDomOverlay();
        this.initCamera();
        this.initControls();
        this.initComposer();
        this.initGUI();
        this.initContent();

        if( Project.GetContext() != FXContext.CAPTURE)
            this.HandleResize();
        
        this.StartRendering(); 
    }


    stats:any = Stats();
    container:HTMLElement;
    overlay:HTMLElement;
    progress:HTMLElement;
    canvas:HTMLCanvasElement;
    
    initDOM()
    {
        this.container = document.createElement("div");
        this.container.id = "container";
        this.container.style.backgroundColor = Project.DEFAULT_BG_COLOR;
        //this.container.style.touchAction = "auto";
        document.body.prepend(this.container);


        const c:HTMLCanvasElement = document.createElement("canvas");
        c.id = "incrediblecanvas";
        this.canvas = c;

        if( Project.GetContext() == FXContext.CAPTURE)
        {
            // force canvas at the right size from the start, just in case
            const ar:RunAR = Object.values(RunAR)[Number( Params.getParam(Project.AR_PARAM_ID) )];
            const res:Vector2 = new Vector2();
            switch(ar)
            {
                case RunAR.Square:
                    res.set( this.previewResolutions[0].x, this.previewResolutions[0].y);
                    break;
                case RunAR.Portrait:
                    res.set( this.previewResolutions[1].x, this.previewResolutions[1].y);
                    break;
                case RunAR.Landscape:
                    res.set( this.previewResolutions[2].x, this.previewResolutions[2].y);
                    break;
            }
            //console.log( "capture canvas setup", res.x, res.y)
            this.canvas.width = res.x;
            this.canvas.height = res.y;

            this.container.style.width = res.x + "px";
            this.container.style.height = res.y + "px";
        }
        else 
        {
            window.addEventListener('resize', this.onResize);
            window.addEventListener("keydown", this.onKeyDown.bind(this)); 
            window.addEventListener("mousedown", this.onPointerDown);
            window.addEventListener("mouseup", this.onPointerUp);

            this.container.addEventListener("touchstart", this.onTouchStart);
            this.container.addEventListener("touchmove", this.onTouchMove);
            this.container.addEventListener("touchend", this.onTouchEnd);
            

            this.container.addEventListener( 'pointermove', this.onPointerMove );  
            this.container.addEventListener( 'pointerleave', this.onPointerLeave );  
            this.container.addEventListener( 'pointerenter', this.onPointerEnter );
        }
        

        
    }

    reactDiv:HTMLElement;
    initDomOverlay()
    {
        this.stats.dom.style.display = "none";       
    }

    preventClick(event:MouseEvent)
    {
        event.preventDefault();
        
    }

    updateTitle( newTitle:String )
    {
        if( Project.GetContext() == FXContext.MINTING ) 
            Params.snippet.emit(Params.UPDATE_SIGNAL, {title:newTitle});
    }

    renderer:WebGLRenderer;
    scene:Scene;
    initRenderer()
    {
        if( Project.GetContext() == FXContext.CAPTURE)
        {
            this.renderer = new WebGLRenderer({alpha:false, preserveDrawingBuffer:true, powerPreference:"high-performance", canvas:this.canvas});
            //console.log( "Cansize = " , this.canvas.width, this.canvas.height)
            this.renderer.setSize( this.canvas.width, this.canvas.height);
        }
        else 
        {
            this.renderer = new WebGLRenderer({alpha:false, preserveDrawingBuffer:false, powerPreference:"high-performance", canvas:this.canvas});
        }

        this.container.appendChild( this.renderer.domElement);
        this.scene = new Scene();
        //this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setPixelRatio( 1 );
        this.renderer.outputColorSpace = SRGBColorSpace;
        ColorManagement.enabled = true;
        
    }

    orthoCamSize:number = 100;
    camera:PerspectiveCamera  | OrthographicCamera;
    camInitPosition:Vector3 = new Vector3(0,0,10);
    camTargetInitPosition:Vector3 = new Vector3(0,0,0);
    initCamera()
    {
        let minDim:number = 0;
        if( Project.GetContext() == FXContext.CAPTURE)
        {
            minDim = 1080;
        }
        else 
        {
            minDim = Math.min(window.innerWidth, window.innerHeight);
        }
        
        const relSize:number = minDim / this.orthoCamSize;
        this.camera = new OrthographicCamera( -relSize, relSize, relSize, -relSize, 0, 100 );
        this.camera.position.copy(this.camInitPosition);
        this.camera.lookAt(this.camTargetInitPosition);
    }

    controls:OrbitControls;
    initControls()
    {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.panSpeed = 1;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 2;
        this.controls.enableDamping = (Project.GetContext() != FXContext.CAPTURE);
        this.controls.dampingFactor = 0.5;
        this.controls.target = new Vector3();
        this.controls.enableRotate = false;

        this.controls.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY };
        this.controls.touches = { ONE: TOUCH.PAN, TWO:TOUCH.DOLLY_PAN };
    }

    composer:EffectComposer;
    renderPass:SSAARenderPass;
    filmPass:MyFilmPass;
    fpStren:number = 0.3;
    isMobile:boolean = false;
    initComposer()
    {
        this.isMobile = this.mobileCheck();
        const rendererSize:Vector2 = new Vector2();
        this.renderer.getSize(rendererSize);

        this.composer = new EffectComposer(this.renderer);
        
        const renderPass:SSAARenderPass = new SSAARenderPass(this.scene, this.camera);
        this.renderPass = renderPass;
        this.AAQuality = Project.DEFAULT_AA_QUALITY;
        this.filmPass = new MyFilmPass(this.fpStren, 0, 0, 0.0);
        
        if( this.isMobile )
        {
            renderPass.sampleLevel = 1;
        }
        
        this.composer.addPass(renderPass);
        this.composer.addPass(this.filmPass);

    }

    initGUI()
    {
        this.reactDiv = document.createElement("div");
        
        this.reactDiv.onclick = this.preventClick;
        this.reactDiv.id = "app";
        
        this.container.append(this.reactDiv);
        const root = createRoot(this.reactDiv!)
        root.render(
            <ThemeProvider theme={AppTheme}>
                <CssBaseline />
                <MachineApp/>
            </ThemeProvider>,
            );
    
    
    }

    initContent()
    {
        
        const designer:Designer = new Designer();
        this.scene.add(designer);
        
    }
    
    HandleResize()
    {
        let mw:number = 1080;
        let mh:number = 1080;
        let wratio = 1;
        if( Project.GetContext() != FXContext.CAPTURE)
        {
            mw = Math.ceil( window.innerWidth ) ;
            mh = Math.ceil( window.innerHeight );
            wratio = mw / mh;
        }
        
        let dx;
        let dy;
        this.aspect = wratio;

        Designer.instance.updateSpaceAR(Designer.instance.currentAR, false);

        let bw:number,bh:number;
        dx = mw;
        dy = mh;
        const cam:OrthographicCamera = this.camera as OrthographicCamera;
        let minDim:number = 0 ;
        this.orthoCamSize = 100;
        
        if( this.capturing)
        {
            
           
            if( Designer.instance.currentAR == RunAR.Square)
            {
                dx = this.captureResolution[0][0].x;
                dy = this.captureResolution[0][0].y;
                this.camera.zoom = 1;
            }
            else if( Designer.instance.currentAR == RunAR.Portrait)
            {
                dx = this.captureResolution[1][0].x;
                dy = this.captureResolution[1][0].y;
                this.camera.zoom = 1.25;
            }
            else if( Designer.instance.currentAR == RunAR.Landscape)
            {
                dx = this.captureResolution[2][0].x;
                dy = this.captureResolution[2][0].y;
                this.camera.zoom = 1.25;
            }
            minDim = Math.min(dx, dy);
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.controls.target.set(0,0,0);

            this.adjustFilmgrain( minDim / 1080);
           
        }
        else if( this.capturingBP)
        {
            dx = this.blueprintResolution[0].x;
            dy = this.blueprintResolution[0].y;
            minDim = Math.min(dx, dy);
            this.camera.zoom = Designer.ZOOMED_IN_TARGET;
            this.camera.position.x = 0;
            this.camera.position.y = .7;
            this.controls.target.set(0,.7,0);   

            
        }
        else if( Project.GetContext() == FXContext.CAPTURE)
        {
            
            const arIndex:number = Number( Params.getParam(Project.AR_PARAM_ID) );
            
            const res:Vector2 = this.previewResolutions[arIndex];
            dx = res.x;
            dy = res.y;
            minDim = Math.min(dx, dy);
            if( arIndex == 0)
                this.camera.zoom = 1 ;
            else 
                this.camera.zoom = 1.25;

            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.controls.target.set(0,0,0);
            this.controls.update();

            //console.log("capture context resize -> arIndex: " , arIndex, this.camera.zoom);
        }
        else 
        {
            // this section is crime against coding and logic... giga brain fart
            minDim = Math.min(window.innerWidth, window.innerHeight);
            
            if( Designer.instance.currentMode != "build")
            {
                if( Designer.instance.currentAR == RunAR.Portrait)
                {
                    
                    if( wratio < 2/3)
                    {
                        this.orthoCamSize = 80;
                    }
                    else if( wratio > 1 )
                    {
                        this.orthoCamSize = 120;
                    }
                    else 
                    {
                        const dr:number = Math.pow( (wratio - 2/3) / (1 - 2/3), 0.95 );
                        this.orthoCamSize = MathUtils.lerp(80, 120, dr);
                    }
                    
                }
                else if( Designer.instance.currentAR == RunAR.Landscape)
                {
                    if( wratio >= 3/2) 
                    {
                        this.orthoCamSize = 80;
                    }
                    else if( wratio < 1 )
                    {
                        this.orthoCamSize = 120;
                    }
                    else 
                    {
                        const dr:number = Math.pow( (3/2 - wratio) / (3/2 - 1), 1.25 );
                        this.orthoCamSize = MathUtils.lerp(80, 120, dr);
                    }
                }
            }
        }

        this.adjustFilmgrain( minDim / 2048);

        const relSize:number = minDim / this.orthoCamSize;

        cam.left = -dx / relSize /2;
        cam.right = dx/ relSize /2;
        cam.top = dy/ relSize /2;
        cam.bottom = -dy/ relSize / 2;
        
       
        if( Project.GetContext() != FXContext.CAPTURE)
        {
            this.container.style.width = mw + "px";
            this.container.style.height = mh + "px";
        }
        else 
        {
            //this.container.style.width = dx + "px";
            //this.container.style.height = dy + "px";
            this.container.style.width = mw + "px";
            this.container.style.height = mh + "px";
        }

        if( this.reactDiv != undefined)
        {
            this.reactDiv.style.width = mw + "px";
            this.reactDiv.style.height = mh + "px";
        }

        this.renderer.setSize(dx, dy);
        this.renderer.setPixelRatio( 1 );
        this.composer.setSize(dx, dy);
        this.camera.updateProjectionMatrix();

        //console.log( "HandleResize", dx, dy, devicePixelRatio );        

        this.render(0,0);

    }

    clock:Clock;
    StartRendering()
    {
        this.clock = new Clock(true);
        requestAnimationFrame( Project.HandleAnimationFrame );
    }

    static HandleAnimationFrame()
    {
        Project.instance.animate();
        requestAnimationFrame( Project.HandleAnimationFrame );
    }

    previewDone:boolean = false;
    animate()
    {

        const dt:number = this.clock.getDelta();
        const elapsed:number = this.clock.getElapsedTime();
        if( (Project.GetContext() == FXContext.CAPTURE) && !this.previewDone)
        {
            this.handleContentAnimation(dt,elapsed);
            

            const progress:number = Execute.instance.calcProgress();
            if( progress >= 1)
            {
                Designer.instance.SetCaptureMode(true);
                this.HandleResize();
                this.render(dt, elapsed);
                this.snippet.preview();
                //this.tryExport();
                this.previewDone = true;
            }            
        }
        else 
        {
            this.controls.update();
            
            //console.log( "Zoom=" , this.camera.zoom);

            if( !this.capturing && !this.capturingBP)
            {
                this.adjustAA(dt);
                this.handleContentAnimation(dt,elapsed);
                this.render(dt, elapsed);
            }

            if( this.stats != undefined )
                this.stats.update();
        }
        
    }

    frameTimeHistory:number[] = [];
    aaThreshold:Vector2 = new Vector2(1/60, 1/40);
    lastAAChange:number = 0;
    autoAdujstAA:boolean = false;
    static DEFAULT_AA_QUALITY:number = 3;
    static CAPTURE_AA_QUALITY:number = 4;
    savedAAQuality:number = 3;
    get AAQuality ():number
    {
        return this.renderPass.sampleLevel;
    }

    set AAQuality (v:number)
    {
        this.renderPass.sampleLevel = v;
    }

    adjustAA(dt:number ) // humm ...
    {
        if(Project.GetContext() == FXContext.CAPTURE || this.isMobile)
            return ;
        if( !this.autoAdujstAA)
            return ;

        this.frameTimeHistory.push(dt);
        if( this.frameTimeHistory.length > 60)
            this.frameTimeHistory.shift();
        
        let sum:number = 0;
        for( let i:number = 0; i < this.frameTimeHistory.length; i++)
            sum += this.frameTimeHistory[i];

        const avg:number = sum / this.frameTimeHistory.length;
        const current:number = this.renderPass.sampleLevel;
        const ct:number = performance.now();

        if( Designer.instance.currentMode == "build")
        {
            this.renderPass.sampleLevel = 4;
            return ;
        }

        if( ct - this.lastAAChange > 1000)
        {
            if( avg < this.aaThreshold.x && current < 4)
            {
                this.renderPass.sampleLevel++;
                this.lastAAChange = ct;
            }
            else if( avg > this.aaThreshold.y && current > 1)
            {
                this.renderPass.sampleLevel--;
                this.lastAAChange = ct;
            }
            
        }

        //console.log( "AA", avg, this.renderPass.sampleLevel);
    }

    // to test the toDataURL. Problem seems to come from the rendering instance. Dynamic canvas size doen't work on NON GPU instances. Fixed canvas size works fine
    tryExport()
    {
        var imgData, imgNode;
        try
        {
            var strMime = "image/jpeg";
            const selector:string = "#incrediblecanvas";   
            const element:HTMLCanvasElement = document.querySelector(selector) as HTMLCanvasElement;
            //imgData = this.renderer.domElement.toDataURL(strMime, 1.0);
            imgData = element.toDataURL(strMime, 1.0);
            var strDownloadMime = "image/octet-stream";
            let filename = `CapTest_${(Date.now())}.jpg`
            this.saveFile(imgData.replace(strMime, strDownloadMime), filename);    
    
        }
        catch (e)
        {
            console.log(e);
            return;
        }
    }

    saveFile(strData, filename)
    {
        var link = document.createElement('a');
        if (typeof link.download === 'string')
        {
            //document.body.appendChild(link); //Firefox requires the link to be in the body
            this.container.appendChild(link);
            link.download = filename;
            link.href = strData;
            link.click();
            
            this.container.removeChild(link);
    
        } else {
            //location.replace(uri);
        }
    }


    animElems = [];
    handleContentAnimation(dt:number, elapsed:number)
    {
        this.animElems.forEach( (elem) => 
        {
             elem.update(dt, elapsed);
        });

    }

    static RegisterAnimElem(elem:any)
    {
        Project.instance.animElems.push(elem);
    }

    static UnregisterAnimElem(elem:any)
    {
        const index:number = Project.instance.animElems.indexOf(elem);
        if( index >= 0)
            Project.instance.animElems.splice(index, 1);
    }

    render(dt:number, elapsed:number)
    {   
        this.composer.render();
    }

    onResize(event)
    {
        Project.instance.HandleResize();
    }

    keyDownHistory:string[] = [];
    maxKeyHistory = 10;
    onKeyDown(event)
    {
        if( event.keyCode == 88)
            Project.toggleStatVisibility();

        this.keyDownHistory.push( event.key );
        if( this.keyDownHistory.length > this.maxKeyHistory)
            this.keyDownHistory.shift();
        
        if( this.keyDownHistory.join('').indexOf(Project.SUPER_SECRET_CHEAT_CODE) != -1 && !Project.SUPER_SECRET_CHEAT_MODE_ENABLED ) 
            this.enableCheat();

    }

    enableCheat()
    {
        Project.SUPER_SECRET_CHEAT_MODE_ENABLED = true;
    }

    static toggleStatVisibility()
    {
        //console.log( "toggleStatVisibility", Project.instance.stats);
        if( Project.instance.stats.dom.style.display == "none")
            Project.instance.stats.dom.style.display = "block";
        else 
            Project.instance.stats.dom.style.display = "none"
    }

    pointerDown:boolean = false;
    pointer:Vector2 = new Vector2();
    onPointerDown(event) {
        Project.instance.pointer.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
        );
        Project.instance.pointerDown = true;
    }
    onPointerUp(event) {
        Project.instance.pointer.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
        );
        Project.instance.pointerDown = false;
    }
    onPointerMove(event) {

        //console.log( "onPointerMove", event.clientX, event.clientY, window.innerWidth, window.innerHeight, devicePixelRatio)

        Project.instance.pointer.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
        );

        //Project.instance.recordPosition();
    }

    onTouchStart(event) {
        Project.instance.pointer.set(
            ( event.touches[0].clientX / window.innerWidth ) * 2 - 1,
            - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1
        );
        Project.instance.pointerDown = true;
    }
    onTouchEnd(event) {

        Project.instance.pointerDown = false;
    }
    onTouchMove(event) {
        Project.instance.pointer.set(
            ( event.touches[0].clientX / window.innerWidth ) * 2 - 1,
            - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1
        );
    }


    onPointerEnter(event) {}
    onPointerLeave(event) {}

    selectedCaptureRes:Vector2 = new Vector2(1080,1080);
    selectedBPCaptureRes:Vector2 = new Vector2(1080,1080);
    requestCapture( resolution:Vector2 = new Vector2(1080,1080) )
    {
        //console.log("requestCapture", resolution);
        this.selectedCaptureRes.copy(resolution);
        Execute.instance.pause();
        onCaptureStart();
        this.capturing = true;
        Designer.instance.SetCaptureMode(true);
        this.savedAAQuality = this.AAQuality;
        this.AAQuality = Project.CAPTURE_AA_QUALITY;
        this.HandleResize();
        this.saveAsImage();
    }

    requestBPCapture(resolution:Vector2 = new Vector2(1080,1080))
    {
        //console.log("requestBPCapture", resolution);
        this.selectedBPCaptureRes.copy(resolution);
        Execute.instance.pause();
        onCaptureStart();
        this.capturingBP = true;
        Designer.instance.SetCaptureBPMode(true);
        this.savedAAQuality = this.AAQuality;
        this.AAQuality = Project.CAPTURE_AA_QUALITY;
        this.HandleResize();
        this.saveBPAsImage();
    }

    saveAsImage() 
    {
        let w:number = this.selectedCaptureRes.x;
        let h:number = this.selectedCaptureRes.y;
        
        this.makeBigPng(this.renderer, w, h).then((blob) => {
            const url = URL.createObjectURL(blob);
            let filename = Project.PROJECT_NAME + `_#` + Project.instance.snippet.iteration.toString() + `_${(Date.now())}.png`
            this.saveData(blob, filename);
        });

        this.capturing = true;
    }

    saveBPAsImage() 
    {
        let w:number = this.selectedBPCaptureRes.x;
        let h:number = this.selectedBPCaptureRes.y;
        
        this.makeBigPng(this.renderer, w, h).then((blob) => {
            const url = URL.createObjectURL(blob);
            let filename = Project.PROJECT_NAME + `_blueprint` + `_#` + Project.instance.snippet.iteration.toString() + `_${(Date.now())}.png`
            this.saveData(blob, filename);
        });

        this.capturingBP = true;
    }

    saveData = (function() {
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        return function saveData(blob, fileName) 
        {
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
        };
    }());

    async makeBigPng(renderer, width, height) 
    {

        const pngRGBAWriter = new PNGRGBAWriter(width, height);
      
        const chunkWidth  = 512;
        const chunkHeight = 512;

        updateProgress(0);
        
        for (let chunkY = 0; chunkY < height; chunkY += chunkHeight) 
        {
            const rowChunks = [];
            const localHeight = Math.min(chunkHeight, height - chunkY);
        
            for (let chunkX = 0; chunkX < width; chunkX += chunkWidth)
            {
                const localWidth = Math.min(chunkWidth, width - chunkX);
        
                const data = this.drawArea(width, height, chunkX, chunkY, localWidth, localHeight);
                rowChunks.push(data);
            }
        
            for (let row = 0; row < localHeight; ++row) 
            {
                    rowChunks.forEach((chunk, ndx) => {
                        const rowSize = chunk.width * 4;
                        const chunkOffset= rowSize * row;
                        pngRGBAWriter.addPixels(chunk.data, chunkOffset, chunk.width);
                    });
            }
            const p:number = Math.min(1, (chunkY + chunkHeight) / height);
            updateProgress(p);
            await this.wait();
        }
        
        Project.instance.resetAfterCapture();
        return pngRGBAWriter.finishAndGetBlob();

      }

      resetAfterCapture()
      {
        
        if( this.capturing)
        {
            Designer.instance.SetCaptureMode(false);
            const minDim = (window.innerWidth > window.innerHeight) ? window.innerHeight : window.innerWidth;        
            this.renderer.setPixelRatio( 1 );
            this.renderer.setSize(minDim , minDim);
            this.camera.zoom = Designer.ZOOMED_OUT_TARGET;
            this.controls.target.set(0,0,0);
            this.camera.clearViewOffset()
            this.capturing = false;
            this.capturingBP = false;
            this.AAQuality = this.savedAAQuality;
            this.HandleResize();
            this.composer.render();
            onCaptureEnd();
        }
        else if( this.capturingBP) 
        {
            Designer.instance.SetCaptureBPMode(false);
            const minDim = (window.innerWidth > window.innerHeight) ? window.innerHeight : window.innerWidth;        
            this.renderer.setPixelRatio( 1 );
            this.renderer.setSize(minDim , minDim);
            this.camera.zoom = Designer.ZOOMED_OUT_TARGET;
            this.controls.target.set(0,0,0);
            this.camera.clearViewOffset()
            this.capturing = false;
            this.capturingBP = false;
            this.AAQuality = this.savedAAQuality;
            this.HandleResize();
            this.composer.render();
            onCaptureEnd();
        }
      }

      wait() {
        return new Promise((resolve) => {
          setTimeout(resolve);
        });
      }

      drawArea(width, height, chunkX, chunkY, chunkWidth, chunkHeight) {
        const { renderer, camera, scene } = this;
    
        this.renderer.setSize( chunkWidth, chunkHeight );
        
        this.camera.aspect = chunkWidth / chunkHeight;
        //this.orthoCam.aspect = this.camera.aspect;
        this.camera.setViewOffset( width, height, chunkX, chunkY, chunkWidth, chunkHeight );
        //this.orthoCam.setViewOffset(width, height, chunkX, chunkY, chunkWidth, chunkHeight );
        this.camera.updateProjectionMatrix();
        //this.orthoCam.updateProjectionMatrix();


        //this.camera.lookAt( scene.position );
        this.camera.updateMatrixWorld();
        //this.orthoCam.updateMatrixWorld();

        this.composer.render();
    
        const data = new Uint8Array(chunkWidth * chunkHeight * 4);
        const gl = this.renderer.getContext();
        gl.readPixels(0, 0, chunkWidth, chunkHeight, gl.RGBA, gl.UNSIGNED_BYTE, data);
    
        // swap lines (should probably just fix code in makeBigPng to read backward
        const lineSize = chunkWidth * 4;
        const line = new Uint8Array(lineSize);
        const numLines = chunkHeight / 2 | 0;
        for (let i = 0; i < numLines; ++i) 
        {
          const topOffset = lineSize * i;
          const bottomOffset = lineSize * (chunkHeight - i - 1);
          line.set(data.slice(topOffset, topOffset + lineSize), 0);
          data.set(data.slice(bottomOffset, bottomOffset + lineSize), topOffset);
          data.set(line, bottomOffset);
        }
        return {
          width: chunkWidth,
          height: chunkHeight,
          data: data,
        };
    }

    
    adjustFilmgrain(scale:number)
    {
        const calc:number = this.fpStren * scale;
        this.filmPass.uniforms.nIntensity.value  = calc;
        this.filmPass.material.needsUpdate = true;
    }

    mobileCheck() 
    {
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor );
        return check;
      
    };
}

export {Project};