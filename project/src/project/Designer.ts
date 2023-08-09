import { Box2, Group, MathUtils, OrthographicCamera, Vector2, Vector3 } from "three";
import { Build } from "./machine/Build";
import { Project } from "./Project";
import { Module, ModuleType } from "./machine/structs/Module";
import { Execute } from "./machine/Execute";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";
import { Easing } from "../helpers/Easing";
import { FXContext } from "../helpers/FXSnippet";
import { setDesignerInstance } from "./react/App";
import { updateSelectedPaletteIndex } from "./react/PaletteMenu";

import JSONCrush from "jsoncrush"
import { Params } from "../helpers/Params";
import { Palette } from "./machine/Palette";
import { Features } from "../helpers/Features";

enum RunAR // renard
{
    Square = "Square",
    Portrait = "Portrait",
    Landscape = "Landscape"
}

class Designer extends Group
{
    static instance:Designer;
    static SPACE_SIZE:number = 7;
    static SPACE:Box2 = new Box2(new Vector2(-Designer.SPACE_SIZE/2, -Designer.SPACE_SIZE/2), new Vector2(Designer.SPACE_SIZE/2, Designer.SPACE_SIZE/2));
    static ZOOMED_IN_TARGET:number = 9;
    static ZOOMED_OUT_TARGET:number = 1;

    modules:Module[] = [];
    build:Build;
    execute:Execute;
    currentMode:string = "build";
    currentAR:RunAR = RunAR.Square;
    constructor()
    {
        super();
        Designer.instance = this;
        setDesignerInstance(this); // hook for react app

        this.initModules();

        const ar:RunAR = Object.values(RunAR)[Number( Params.getParam(Project.AR_PARAM_ID) )];
        //console.log( "ar param : ","AR=", ar, "Param=",Params.getParam(Project.AR_PARAM_ID));

        this.updateSpaceAR(ar);
        

        this.build = new Build(this.modules);
        super.add(this.build);
        
        this.execute = new Execute(this.modules);
        super.add(this.execute);
        
        const configstring:string = Params.getParam(Project.CONFIG_PARAM_ID) as string;
        if( Project.GetContext() == FXContext.MINTING)
        {
            //Project.instance.HandleResize();
            if( configstring.length > 0) // if we have a config, we use that
            {
                this.DeserializeModules();
            }
            else 
            {
                // generate a random machine 
                this.build.autoBuildRandomMachine();
            }
            
            this.setMode("build");
        }
        else 
        {
            if( configstring.length > 0)
                this.DeserializeModules();
            else 
            {
                // generate a random machine, should only happen when trying out the generator before mint on the gentk page
                this.build.autoBuildRandomMachine();
            }
            
            this.setMode("execute");
        }

        this.initCam();
        Project.RegisterAnimElem(this);
        
    }

    updateTitle(title:string)
    {
        if( this.build != undefined)
            this.build.updateTitle(title);
    }

    updateSpaceAR(val:RunAR, resize:boolean = true)
    {
        
        //const ar:RunAR = Params.getParam(Project.AR_PARAM_ID) as RunAR;
        const ar:RunAR = val;
        const s:number = Designer.SPACE_SIZE;
        const w:number = s;
        const h:number = s;

        if( ar == RunAR.Square)
        {
            Execute.worldSize.set(100,100);
            Execute.hWorldSize.set(Execute.worldSize.x/2,Execute.worldSize.y/2);
        }
        else if( ar == RunAR.Portrait)
        {
            Execute.worldSize.set(80,120);
            Execute.hWorldSize.set(Execute.worldSize.x/2,Execute.worldSize.y/2);

        }
        else if( ar == RunAR.Landscape)
        {
            Execute.worldSize.set(120,80);
            Execute.hWorldSize.set(Execute.worldSize.x/2,Execute.worldSize.y/2);
        }

        if( val == this.currentAR)
            return;
        
        const msg:{}={};
        this.currentAR = ar;
        msg[Project.AR_PARAM_ID] = BigInt( Object.values(RunAR).indexOf(ar) );

        if( Project.GetContext() == FXContext.MINTING)
            Params.snippet.emit(Params.UPDATE_SIGNAL, msg );

        if( resize)
            Project.instance.HandleResize();

    }

    
    zoomTarget:number = Designer.ZOOMED_IN_TARGET;    
    zoomTransition:number = 0;
    zoomTransitionDuration:number = 1;
    
    setMode(mode:string)
    {
        //console.log( "set mode", mode)
        this.setZoomLimits(mode)
        if( this.currentMode == mode)
            return;
        if( mode == "build")
        {
            this.zoomTarget = Designer.ZOOMED_IN_TARGET;
            this.zoomTransition = 0;
            this.build.show();
            
            if( this.execute != undefined)
                this.execute.hide();
        }
        else
        {
            this.zoomTarget = Designer.ZOOMED_OUT_TARGET;
            this.zoomTransition = 0;
            this.build.hide();
            
            if( this.execute != undefined)
                this.execute.show();
            
        }
        this.setZoomLimits(mode);
        
        this.currentMode = mode;

        Project.instance.HandleResize();
    }

    maxPan:Vector2 = new Vector2(10, 10);
    setZoomLimits(mode:string )
    {
        const c:OrbitControls = Project.instance.controls as OrbitControls;
        if( mode == "build")
        {
            c.maxZoom = 50.0;
            c.minZoom = 5.0;

            this.maxPan.set(8, 8);
        }
        else 
        {
            c.maxZoom = 50.0;
            c.minZoom = 0.7;
            if( this.currentAR == RunAR.Square)
                this.maxPan.set(50, 50);
            else if( this.currentAR == RunAR.Portrait)
                this.maxPan.set(40, 60);
            else if( this.currentAR == RunAR.Landscape)
                this.maxPan.set(60, 40);
        }
    }

    initModules()
    {
        const s:number = Designer.SPACE_SIZE;
        
        for( let j:number=0;j<s;j++)
        {
            for( let i:number=0;i<s;i++)
            {
            
                const m:Module = new Module();
                m.position.set(i,j);
                this.modules.push(m);
            }
        }
    }

    update(dt:number, elapsed:number)
    {
        if( this.build != undefined)
            this.build.update(dt, elapsed);
        if( this.execute != undefined)
            this.execute.update(dt, elapsed);

        this.HandleModeTransitionZoom(dt, elapsed);
        this.constrainCamera();
        
    }

    static BUILD_CAM_INIT_POS:Vector3 = new Vector3(0,-0.75,10);
    static RUN_CAM_INIT_POS:Vector3 = new Vector3(0,0,10);
    static CAM_TARGET_POS:Vector3 = new Vector3(0,0,0);

    initCam()
    {
        const cam:OrthographicCamera = Project.instance.camera as OrthographicCamera;
        const controls:OrbitControls = Project.instance.controls as OrbitControls;
        if( Project.GetContext() == FXContext.MINTING)
        {
            cam.zoom = 8;
            cam.position.copy(Designer.BUILD_CAM_INIT_POS);
            controls.target.copy(Designer.CAM_TARGET_POS);
        }
        else
        {
            cam.zoom = 1;
            cam.position.copy(Designer.RUN_CAM_INIT_POS);
            controls.target.copy(Designer.CAM_TARGET_POS);
        }
        
        controls.update();
    }

    
    HandleModeTransitionZoom(dt:number, elapsed:number)
    {
        const cam:OrthographicCamera = Project.instance.camera as OrthographicCamera;
        const controls:OrbitControls = Project.instance.controls as OrbitControls;
        if( this.zoomTransition < this.zoomTransitionDuration)
        {
            this.zoomTransition += dt;
            const t:number = this.zoomTransition / this.zoomTransitionDuration;
            let mt:number = t;
            mt = Easing.easeInOutCirc(t);
            if( this.zoomTransition >= this.zoomTransitionDuration)
                mt = 1;
            
            cam.zoom = MathUtils.lerp(cam.zoom, this.zoomTarget, mt);

            if( this.currentMode != "build")
            {
                cam.position.lerpVectors(cam.position, Designer.RUN_CAM_INIT_POS, mt);
                Designer.CAM_TARGET_POS.set(Designer.RUN_CAM_INIT_POS.x, Designer.RUN_CAM_INIT_POS.y, 0);
            }
            else 
            {
                cam.position.lerpVectors(cam.position, Designer.BUILD_CAM_INIT_POS, mt);
                Designer.CAM_TARGET_POS.set(Designer.BUILD_CAM_INIT_POS.x, Designer.BUILD_CAM_INIT_POS.y, 0);
            }
            controls.target.lerpVectors(controls.target, Designer.CAM_TARGET_POS, mt);
        }
    }

    constrainCamera()
    {
        const cam:OrthographicCamera = Project.instance.camera as OrthographicCamera;
        const controls:OrbitControls = Project.instance.controls as OrbitControls;
        cam.position.x = Math.max( - this.maxPan.x, Math.min( this.maxPan.x, cam.position.x ) );
        cam.position.y = Math.max( - this.maxPan.y, Math.min( this.maxPan.y, cam.position.y ) );
        controls.target.x = cam.position.x;
        controls.target.y = cam.position.y;
    }

    static OnModulesChanged()
    {
        Designer.instance.onModulesChanged();
    }

    onModulesChanged()
    {
        this.SerializeModules();
    }

    SerializeModules()
    {
        const modules:any[] = [];
        for( let i:number=0;i<this.modules.length;i++)
        {
            const m:Module = this.modules[i];
            if( m.type != ModuleType.Empty)
                modules.push(m.prepareForSerialization());
            else 
                modules.push({});
        }
        const ser:string = JSON.stringify(modules);
        //console.log( "Serialized Modules: size=" , ser.length , ser) ;
        const crushed:string = encodeURIComponent( JSONCrush.crush(ser) );
        console.log( "Crushed Serialized Modules: size=" , crushed.length ) ;        
        this.SaveToParams(crushed);
    }

    SaveToParams(str:string)
    {

        const msg:{} = {};
        msg[Project.CONFIG_PARAM_ID] = str;
        msg[Project.AR_PARAM_ID] = BigInt( Object.values(RunAR).indexOf(this.currentAR) );
        msg[Project.PALETTE_PARAM_ID] = BigInt( Palette.selectedPalette );

        if( Project.GetContext() == FXContext.MINTING)
            Project.instance.snippet.emit(Params.UPDATE_SIGNAL,msg);
        
        updateSelectedPaletteIndex(Palette.selectedPalette);

    }

    DeserializeModules()
    {
        const palnum:number = Number( Params.getParam(Project.PALETTE_PARAM_ID) );
        if( palnum != undefined)
        {
            Palette.SetupPalette(palnum);
        }

        const title:string = Params.getParam(Project.TITLE_PARAM_ID);
        if( title != "")
            this.build.updateTitle(title, true);

        const crushed:string = Params.getParam(Project.CONFIG_PARAM_ID);
        if( crushed == undefined)
        {
            console.log( "No modules to deserialize");
            return;
        }
        
        const uncrushed:string = JSONCrush.uncrush(decodeURIComponent(crushed));
        const data:any[] = JSON.parse(uncrushed);
        //console.log( "UnCrushed Serialized Modules: length = ", uncrushed.length , "\n" , data  );
        this.build.BuildMachineFromData(data);

    }

    SetCaptureMode(mode:boolean)
    {
        if( mode)
        {
            super.remove(this.build);
        }
        else 
        {
            super.add(this.build);
        }
    }

    SetCaptureBPMode(mode:boolean)
    {
        if( mode)
        {
            
            this.execute.ResetSim();

            this.zoomTarget = Designer.ZOOMED_IN_TARGET;
            this.zoomTransition = this.zoomTransitionDuration;

            this.setMode("build");
            this.build.show();
            
            this.build.grid.gridMaterial.opacity = 1;
            this.build.update(0,0);


        }
        else 
        {
            super.add(this.execute);
            this.setMode("execute");
            
        }
    }
}

export {Designer, RunAR};