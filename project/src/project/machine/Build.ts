import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Object3D, Raycaster, Vector2, Vector3, InstancedMesh , Color, PlaneGeometry, BufferGeometry, TextureLoader, Texture, DynamicDrawUsage} from "three";
import { ModuleVis } from "./ModuleVis";
import { Project } from "../Project";
import { isModuleMenuOpen, openModuleMenu } from "../react/ModuleMenu";
import { isOrientationMenuOpen, openOrientationMenu, closeOrientationMenu } from "../react/OrientationMenu";
import { openModuleEditMenu, hasAnyMenuOpen } from "../react/BuildUI";
import { Grid } from "./Grid";
import { BoolConfigParam, ColorMode, ConfigParam, FloatConfigParam, IntConfigParam, ModConfig, Module, ModuleOrientation, ModuleType, MotorConfig, ParticleShape, ParticlesConfig, PerlinConfig, RibbonConfig, RocketConfig, RotatorConfig, SelectConfigParam, SwitchConfig, WaveConfig, WaveShape } from "./structs/Module";
import { Designer, RunAR } from "../Designer";
import { Rand } from "../../helpers/Rand";
import { FXContext } from "../../helpers/FXSnippet";
import { Params } from "../../helpers/Params";
import { Palette } from "./Palette";
import { isOnboardingOpen } from "../react/App";
import { Easing } from "../../helpers/Easing";



class Build extends Group
{
    

    static instance:Build;
    testBlock:ModuleVis;

    moduleContainer:Group;
    isDragging:boolean = false;
    dragBlock:ModuleVis =null;
    hoverBlock:ModuleVis = null;
    ghostBlock:Mesh = null;
    
    static GhostMaterial:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true, opacity:1.0});
    static GhostDepth:number = -.2;
    static GhostOKColor:number = 0x3dc1ff;
    static GhostBadColor:number = 0xe42538;


    raycaster:Raycaster;
    grid:Grid;
    
    modules:Module[];

    static SMOKE_PARTICLE = "./assets/smokepart.png";
    static MAX_SMOKE_PARTICLES = 32;

    smokeMesh:InstancedMesh;

    constructor(modules:Module[])
    {
        
        super();
        Build.instance = this;
        this.modules = modules;
        
        this.raycaster = new Raycaster();
        this.grid = new Grid();
        this.grid.position.set(0,0,-11);
        this.grid.show();
        super.add(this.grid);

        this.ghostBlock = new Mesh(new BoxGeometry(ModuleVis.SIZE,ModuleVis.SIZE,ModuleVis.SIZE), Build.GhostMaterial);
        this.ghostBlock.visible = false;
        this.ghostBlock.position.set(0,0,Build.GhostDepth);
        this.grid.add(this.ghostBlock);

        this.moduleContainer = new Group();
        super.add(this.moduleContainer);

        this.initSmoke();

        if( Project.GetContext() != FXContext.CAPTURE)
            window.addEventListener("pointerup", this.onPointerUp);


    }

    show()
    {
        this.grid.show();
        if( this.useSmoke)
            this.smokeMesh.visible = true;
    }

    hide()
    {
        this.grid.hide();
        if( this.useSmoke)
            this.smokeMesh.visible = false;
    }

    onPointerUp(event) {
        
        Build.instance.onClick(event);
    }

    onClick(event)
    {
        
        const p:Vector2 = Project.instance.pointer;
        if( event.type == "touchend" )
        {
            p.set(
                ( event.touches[0].clientX / window.innerWidth ) * 2 - 1,
                - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1
            );
        }

        
        
        const mod:ModuleVis = this.raycastModules(p);

        //console.log( "Build pointer up", event, mod, this.justReleaseABlock, this.isDragging, this.checkCursorAvailability());  
        //console.log("click", mod, p);
        if(mod != null 
            && this.checkCursorAvailability()
            && !this.justReleaseABlock
            && !this.isDragging)
        {
            
            mod.highlight();
            const position = {left:event.clientX, top:event.clientY};
            console.log("open menu", position);
            openModuleMenu(position, mod.moduleRef);
        }
        
        if( isOrientationMenuOpen())
        {
            console.log( "Build closeOrientationMenu :", event);
            if(event.pointerType != "touch")
                closeOrientationMenu();
        }

        
    }

    static DestroyModule(mod:Module)
    {
        Build.instance.destroyModule(mod);
    }

    static Clear(updateParams:boolean = true)
    {
        Build.instance.clearAllBlocks(updateParams);
    }

    clearAllBlocks( updateParam:boolean = true)
    {
        for( let i:number = 0 ;i< this.modules.length; i++)
        {
            const m:Module = this.modules[i];
            m.type = ModuleType.Empty;
            this.moduleContainer.remove(m.vis);
            m.vis = null;
            m.orientation = ModuleOrientation.Up;
        }

        this.grid.updateLinks(this.modules);

        if( updateParam)
            Designer.OnModulesChanged();
    }

    destroyModule(mod:Module)
    {
        for( let i:number = 0 ;i< this.modules.length; i++)
        {
            const m:Module = this.modules[i];
            if(m == mod)
            {
                m.type = ModuleType.Empty;
                m.vis.destroy();
                this.SmokePuff(m.vis.position);
                //this.moduleContainer.remove(m.vis);
                m.vis = null;
                m.orientation = ModuleOrientation.Up;
                break;
            }
        }
        this.grid.updateLinks(this.modules);

        Designer.OnModulesChanged();
    }

    static MenuMoveModule(mod:Module)
    {
        Build.instance.menuMoveModule(mod);
    }

    menuMoveModule(mod:Module)
    {
        this.dragBlock = mod.vis;
        this.ghostBlock.visible = true;
        this.isDragging = true;
        this.ghostBlock.position.copy(mod.vis.position);
        mod.vis = null;
        mod.orientation = ModuleOrientation.Up;
        mod.type = ModuleType.Empty;

        if( Project.GetContext() != FXContext.CAPTURE)
            window.addEventListener("pointerup", this.stopDrag);        
    }

    static MenuOrientModuule( mod:Module)
    {
        Build.instance.menuOrientModule(mod);
    }

    menuOrientModule(mod:Module)
    {
        if( Project.GetContext() == FXContext.CAPTURE)
            return;
        
        const pos:Vector3 =  new Vector3();
        mod.vis.getWorldPosition(pos);
        
        pos.project(Project.instance.camera);
        console.log("menuOrientModule", pos);

        const hw:number = window.innerWidth * .5;
        const hh:number = window.innerHeight * .5;
        pos.x = (pos.x * hw) + hw;
        pos.y = -(pos.y * hh) + hh;
        const position = {left:pos.x, top:pos.y};
        openOrientationMenu(position, mod);
    }

    static AddBlock(data:any, event:any, onclick:boolean = false)
    {
        //console.log("AddBlock : ", event, onclick);
        Build.instance.addBlock(data, event, onclick);
    }

    raycastPlane(screenCoordinates:Vector2):Vector3
    {
        this.raycaster.setFromCamera(screenCoordinates, Project.instance.camera);
        const intersects = this.raycaster.intersectObject(this.grid, true);
        
        if(intersects.length > 0)
        {
            return intersects[0].point;
        }
        return null;
    }

    raycastModules(screenCoordinates:Vector2):ModuleVis
    {
        this.raycaster.setFromCamera(screenCoordinates, Project.instance.camera);
        const intersects = this.raycaster.intersectObject(this.moduleContainer, true);
        
        if(intersects.length > 0)
        {
            return intersects[0].object.parent as ModuleVis;
        }

        return null;
    }

    addBlock(data:any, event:any, onclick:boolean = false )
    {
        if( this.isDragging)
            return;
        
        // create a new module, set it to the mouse position, add it to the scene, and set it as the dragBlock and set the isDragging flag to true
        console.log( "Addblock event =" , event );
        const dragPt:Vector2 = Project.instance.pointer;
        if( event.type == "touchstart")
        {
            dragPt.set( ( event.touches[0].clientX / window.innerWidth ) * 2 - 1,
            - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1 );
        }
        
        this.ghostBlock.visible = true;
        const pos:Vector3 = this.raycastPlane(dragPt);
        if( pos == null)
        {
            console.log("no position found");
            return;
        }
        const mod:ModuleVis = new ModuleVis(data.id, data.name);
        mod.position.x = pos.x;
        mod.position.y = pos.y;
        this.moduleContainer.add(mod);
        this.dragBlock = mod;
        this.isDragging = true;
        this.ghostBlock.visible = true;
        this.ghostBlock.position.copy(pos);

        if( Project.GetContext() == FXContext.CAPTURE)
            return;
            
        if( !onclick)
        {
            window.addEventListener("pointerup", this.stopDrag);
            window.addEventListener("touchend", this.stopDrag);
        }
        else 
        {
            window.addEventListener("pointerdown", this.stopDrag);
        }
        
    }

    static MenuRotateModule(m:Module, direction:number )
    {
        console.log("MenuRotateModule", m, direction);
        Build.instance.rotateModule(m, direction);
    }

    static SetModuleOrientation(m:Module, orientation:ModuleOrientation)
    {
        console.log("SetModuleOrientation", m, orientation);
        Build.instance.setModuleOrientation(m, orientation);
    }

    setModuleOrientation(m:Module, orientation:ModuleOrientation)
    {
        console.log("setModuleOrientation", m, orientation);
        m.orientation = orientation;

        Designer.OnModulesChanged();
    }

    rotateModule(m:Module, direction:number )
    {
        console.log("rotateModule", m, direction);
        m.orientation += direction;
        if( m.orientation > 3)
        {   
            m.orientation = 0;
        }
        if( m.orientation < 0)
        {
            m.orientation = 3;
        }
        Designer.OnModulesChanged();
    }

    static MenuEditModule(m:Module)
    {
        console.log("MenuEditModule", m);
        Build.instance.editModule(m);
    }

    editModule(m:Module)
    {
        console.log("editModule", m);
        const position = {left:0, top:0};
        openModuleEditMenu(m);
    }

    justReleaseABlock:boolean = false;
    stopDrag()
    {
        Build.instance.releaseAndSnap();

        if( Project.GetContext() == FXContext.CAPTURE)
            return;

        window.removeEventListener("touchend", Build.instance.stopDrag);
        window.removeEventListener("pointerup", Build.instance.stopDrag);
        window.removeEventListener("pointerdown", Build.instance.stopDrag);
    }

    releaseAndSnap()
    {
        const closestSnapPoint:Vector3 = this.dragBlock.position.clone();
        this.snapPosition(closestSnapPoint);      
        const gridPos:Vector2 = this.worldToGrid(closestSnapPoint);

        if( this.isFreeSpace(gridPos.x, gridPos.y))
        {
            //this.dragBlock.position.copy( closestSnapPoint);        
            this.dragBlock.positionTransition = 1;
            this.dragBlock.targetPosition.copy( closestSnapPoint);
            this.SmokePuff( closestSnapPoint);
            const m:Module = this.modules[this.gridToModuleIndex(gridPos)];
            m.type = this.dragBlock.type;
            if( this.dragBlock.lastConfig != null)
                m.config = this.dragBlock.lastConfig;
            //console.log( "Prev config = ", this.dragBlock.lastConfig);
            //m.config = this.dragBlock.lastConfig;
            m.vis = this.dragBlock;
            m.orientation = this.dragBlock.lastOrientation;
            this.dragBlock.moduleRef = m;
        }
        else // invalid space
        {
            if( this.dragBlock.moduleRef != null) // from a move operation
            {
                const m:Module = this.dragBlock.moduleRef;
                const pos:Vector3 = this.gridToWorld( m.position);
                m.vis = this.dragBlock;
                m.orientation = this.dragBlock.lastOrientation;
                m.type = this.dragBlock.type;
                m.config = this.dragBlock.lastConfig;

                this.dragBlock.positionTransition = 1;
                this.dragBlock.targetPosition.copy( pos);
                //this.dragBlock.position.copy( pos);
                this.dragBlock.update(0,0);
            }
            else 
            {
                
                this.dragBlock.position.copy( this.ghostBlock.position);
                this.moduleContainer.remove(this.dragBlock);
            }            
        }        
        this.isDragging = false;
        this.dragBlock = null;
        this.ghostBlock.visible = false;
        
        /// not pretty, this is a hack to prevent the mouseup event from triggering a new block placement on both drag and pointerdown
        this.justReleaseABlock = true;
        setTimeout(() => {
            this.justReleaseABlock = false;
        }, 100);

        this.grid.updateLinks(this.modules);
        Designer.OnModulesChanged();
    }

    worldToGrid(pos:Vector3):Vector2
    {
        const hs:number = Math.floor( Designer.SPACE_SIZE/2 );
        
        const px:number = pos.x + hs;
        const py:number = pos.y + hs;
        //console.log("worldToGrid", pos.x, pos.y, hs, px, py);
        return new Vector2(px, py);
    }

    gridToModuleIndex(pos:Vector2):number
    {
        const index:number = pos.x + pos.y * Designer.SPACE_SIZE;
        return index;
    }

    gridToWorld(pos:Vector2, target:Vector3 = new Vector3() ):Vector3
    {
        const hs:number = Math.floor( Designer.SPACE_SIZE/2 );
        const px:number = pos.x - hs;
        const py:number = pos.y - hs;
        return target.set(px, py, 0);
    }
    
    snapPosition(pos:Vector3)
    {
        // snap the position to the grid
        pos.x = Math.round(pos.x);
        pos.y = Math.round(pos.y);

    }

    smokeParticles:SmokePart[] = [];
    smokeDummy:Object3D = new Object3D();
    useSmoke:boolean = true;
    initSmoke()
    {
        if( !this.useSmoke)
            return;
        const smokeSize:number = .25;
        const smokeGeom:BufferGeometry = new PlaneGeometry( smokeSize, smokeSize, 1,1 );
        const smokeText:Texture = new TextureLoader().load( Build.SMOKE_PARTICLE );
        const smokeMat:MeshBasicMaterial = new MeshBasicMaterial( {map:smokeText, transparent:true, } );
        this.smokeMesh = new InstancedMesh( smokeGeom, smokeMat, Build.MAX_SMOKE_PARTICLES);
        
        for( let i:number = 0; i < Build.MAX_SMOKE_PARTICLES; i++)
        {
            const smoke:SmokePart = new SmokePart();
            smoke.position.set( Number.MAX_VALUE,Number.MAX_VALUE,0);
            
            this.smokeDummy.position.copy( smoke.position);
            this.smokeDummy.rotation.z = smoke.rotation;
            this.smokeDummy.scale.set( smoke.size, smoke.size, smoke.size);
            this.smokeDummy.updateMatrix();

            this.smokeMesh.setMatrixAt(i, this.smokeDummy.matrix);


            this.smokeParticles.push( smoke );
        }

        this.smokeMesh.instanceMatrix.setUsage( DynamicDrawUsage );

        this.smokeMesh.instanceMatrix.needsUpdate = true;


        super.add( this.smokeMesh );
    }

    SmokePuff(pos:Vector3)
    {
        if( !this.useSmoke)
            return;

        for( let i:number = 0; i < this.smokeParticles.length; i++)
        {
            const sm:SmokePart = this.smokeParticles[i];
            const angle:number = Math.random() * Math.PI * 2;
            const dist:number = .25 + Math.random() * .1;
            const x:number = Math.cos(angle) * dist;
            const y:number = Math.sin(angle) * dist;
            sm.position.set( pos.x + x, pos.y + y, 0);
            sm.alpha = 1;
            sm.life = 1;
            sm.rotation = Math.random() * Math.PI * 2;
            sm.size = Math.random() * .75 + .5;
            sm.velocity.set( x * .5 + (-.1 + Math.random() * .1), y * .5  + (-.1 + Math.random() * .1), 0);
            this.smokeDummy.position.copy( sm.position);
            this.smokeDummy.rotation.z = sm.rotation;
            this.smokeDummy.scale.set( sm.size, sm.size, sm.size);
            this.smokeDummy.updateMatrix();


            this.smokeMesh.setMatrixAt(i, this.smokeDummy.matrix);

        }

    }

    updateSmoke()
    {

        if( !this.useSmoke)
            return;

        for( let i:number = 0; i < this.smokeParticles.length; i++)
        {
            const sm:SmokePart = this.smokeParticles[i];
            if( sm.life <= 0)
                continue;

            
            
            sm.life = Math.max( 0, sm.life - .05);
            if( sm.life > .95)
                continue;

            const velmul:number = sm.life * .75 ;
            sm.velocity.multiplyScalar( velmul);
            sm.position.add( sm.velocity );
            sm.rotation += sm.life * Math.PI / 32;
            sm.size = sm.life * 3;

            this.smokeDummy.position.copy( sm.position);
            this.smokeDummy.rotation.z = sm.rotation;
            this.smokeDummy.scale.set( sm.size, sm.size, sm.size);
            this.smokeDummy.updateMatrix();


            this.smokeMesh.setMatrixAt(i, this.smokeDummy.matrix);

        }

        this.smokeMesh.instanceMatrix.needsUpdate = true;

    }

    update(dt:number, elapsed:number)
    {
        this.grid.update(dt, elapsed);
        
        if( this.isDragging && this.dragBlock != null)
        {
            const dragPt:Vector2 = Project.instance.pointer;
            const pos:Vector3 = this.raycastPlane(dragPt);
            if( pos == null)
            {
                console.log("no position found");
                return;
            }
            const closestSnapPoint:Vector3 = pos.clone();
            this.snapPosition(closestSnapPoint);
            const gridPos:Vector2 = this.worldToGrid(closestSnapPoint);
            //this.dragBlock.position.lerpVectors(this.dragBlock.position, closestValidPoint, .5);
            this.dragBlock.position.lerp( pos, .5);
            this.ghostBlock.position.lerpVectors(this.ghostBlock.position, closestSnapPoint, .25);
            this.ghostBlock.position.z = Build.GhostDepth;
            if( this.isFreeSpace( gridPos.x, gridPos.y))
            {
                this.ghostBlock.material.color.setHex(Build.GhostOKColor);
            }
            else 
            {
                this.ghostBlock.material.color.setHex(Build.GhostBadColor);
            }

        }
        else 
        {
            
            const mod:ModuleVis = this.raycastModules(Project.instance.pointer);
            if( mod != null)
            {
                if( this.hoverBlock != null )
                {
                    this.hoverBlock.highlight(false);
                }
                this.hoverBlock = mod;
                if( this.checkCursorAvailability() )
                    mod.highlight(true);
            }
            else 
            {
                if( this.hoverBlock!=null)
                {
                    this.hoverBlock.highlight(false);
                    this.hoverBlock = null;
                }
            }
        }
        
        for( let i:number = 0 ;i< this.modules.length; i++)
        {

            const m:Module = this.modules[i];
            if( m.vis != null)
            {
                m.vis.update(dt, elapsed);
            }
        }

        this.updateSmoke();
       //console.log( this.raycastPlane(Project.instance.pointer) );
    }

    updateTitle(newTitle:string, instant:boolean = false)
    {
        this.grid.updateContraptionTitle(newTitle, instant);

        if( !this.useSmoke || instant)
            return;

        const span:number = newTitle.length * .18;
        for( let i:number = 0; i < this.smokeParticles.length; i++)
        {
            const sm:SmokePart = this.smokeParticles[i];
            const dx:number = Math.random() * span ;
            const x:number = 3.5 - dx;
            const y:number = -4.3;
            sm.position.set( x,y, 0);
            sm.alpha = 1;
            sm.life = 1;
            sm.rotation = Math.random() * Math.PI * 2;
            sm.size = Math.random() * .25 + .1;
            sm.velocity.set(  -.1 + Math.random() * .2, -.1 + Math.random() * .2);
            this.smokeDummy.position.copy( sm.position);
            this.smokeDummy.rotation.z = sm.rotation;
            this.smokeDummy.scale.set( sm.size, sm.size, sm.size);
            this.smokeDummy.updateMatrix();


            this.smokeMesh.setMatrixAt(i, this.smokeDummy.matrix);

        }
    }

    isFreeSpace(x:number, y:number ):boolean
    {
        const index:number = x + y * Designer.SPACE_SIZE;
        if( index < 0 || index >= this.modules.length)
            return false;
        if( x < 0 || x >= Designer.SPACE_SIZE)
            return false;
        if( y < 0 || y >= Designer.SPACE_SIZE)
            return false;

        const m:Module = this.modules[index];
        if( m.type == ModuleType.Empty)
        {
            return true;
        }
        return false;
    }

    autoBuildRandomMachine()
    {
        Palette.RandomizePalette();

        const msg:{}={};
        const ar:number = Math.floor( Math.random()*Object.values(RunAR).length);
        Designer.instance.updateSpaceAR(Object.values(RunAR)[ar]);
        
        const nbModules:number = 10 + Math.floor( Math.random() * 15 ); // max = 7*7 = 49
        const typeTable:ModuleType[] = [];
        for( let i:number = 0; i<2; i++)
        {
            typeTable.push(ModuleType.Rocket);
            typeTable.push(ModuleType.Motor);
            typeTable.push(ModuleType.Motor);
            typeTable.push(ModuleType.Motor);
        }
        for( let i:number = 0; i<2; i++)
        {
            typeTable.push(ModuleType.WaveMod);
        }

        typeTable.push(ModuleType.Block, ModuleType.Party, ModuleType.Spray, ModuleType.Rotator, ModuleType.Perlin, ModuleType.Switch);
        
        let placedModules:number = 0;
        let lastModule:Module = null;
        while( placedModules < nbModules)
        {
            let freeModule:Module = null;
            if( lastModule != null)
            {
                const neighbours:Module[] =this.getEmptyNeighbours(lastModule);
                if( neighbours.length > 0)
                {
                    let freeSpace:boolean = false;
                    while( !freeSpace)
                    {
                        const index:number = Math.floor( Math.random() * neighbours.length );
                        const m:Module = neighbours[index];
                        freeSpace = true;
                        freeModule = neighbours[index];

                    } 
                }
            }

            if( freeModule == null) 
            {
                let freeSpace:boolean = false;                
                while( !freeSpace)
                {
                    const px:number = Math.floor( Math.random() * Designer.SPACE_SIZE);
                    const py:number = Math.floor( Math.random() * Designer.SPACE_SIZE)
                    const pos:Vector2 = new Vector2( px, py);
                    const index:number = pos.x + pos.y * Designer.SPACE_SIZE;
                    const m:Module = this.modules[index];
                    if( m.type == ModuleType.Empty)
                    {
                        freeSpace = true;
                        freeModule = m;
                    }
                }
            }

            const type:ModuleType = typeTable[Math.floor(Math.random() * typeTable.length)];
            if( type == ModuleType.Motor || type == ModuleType.Spray || type == ModuleType.Party)
            {
                const numo:number = Math.floor(Math.random() * 4);
                switch(numo)
                {
                    case 0:
                        freeModule.orientation = ModuleOrientation.Up;
                        break;
                    case 1:
                        freeModule.orientation = ModuleOrientation.Right;
                        break;
                    case 2:
                        freeModule.orientation = ModuleOrientation.Down;
                        break;
                    case 3:
                        freeModule.orientation = ModuleOrientation.Left;
                        break;
                }
            }
            
           
            freeModule.type = type;
            
            const typenum:number = Object.values(ModuleType).indexOf(type);
            const vis:ModuleVis = new ModuleVis(typenum, type);
            const wpos:Vector3 = new Vector3();
            this.gridToWorld(freeModule.position, wpos)
            vis.position.copy( wpos);
            this.moduleContainer.add(vis);
            vis.moduleRef = freeModule;

            freeModule.vis = vis;


            const config:ModConfig = freeModule.config;
            if( config != null)
            {
                if( freeModule.type == ModuleType.Motor)
                {
                    const c:MotorConfig = config as MotorConfig;
                    FloatConfigParam.Randomize(c.power)
                    FloatConfigParam.Randomize(c.directionNoise);
                    FloatConfigParam.Randomize(c.powerNoise);
                    
                }
                else if( freeModule.type == ModuleType.Spray)
                {
                    const c:ParticlesConfig = config as ParticlesConfig;
                    FloatConfigParam.Randomize(c.directionNoise);
                    FloatConfigParam.Randomize(c.power);
                    FloatConfigParam.Randomize(c.powerNoise);
                    FloatConfigParam.Randomize(c.size)
                    BoolConfigParam.Randomize(c.enableCollision);
                    BoolConfigParam.Randomize(c.selfCollide);
                    SelectConfigParam.Randomize(c.shape);
                    SelectConfigParam.Randomize(c.color);
                }
                else if( freeModule.type == ModuleType.Party)
                {
                    const c:RibbonConfig = config as RibbonConfig;
                    //FloatConfigParam.randomize(c.directionNoise);
                    FloatConfigParam.Randomize(c.power);
                    //FloatConfigParam.randomize(c.powerNoise);
                    FloatConfigParam.Randomize(c.width)
                    BoolConfigParam.Randomize(c.enableCollision);
                    SelectConfigParam.Randomize(c.color);

                }
                else if( freeModule.type == ModuleType.WaveMod)
                {
                    const c:WaveConfig = config as WaveConfig;
                    FloatConfigParam.Randomize(c.amplitude);
                    FloatConfigParam.Randomize(c.frequency);
                    FloatConfigParam.Randomize(c.phase);
                    
                }
                else if( freeModule.type == ModuleType.Rotator)
                {
                    const c:RotatorConfig = config as RotatorConfig;
                    BoolConfigParam.Randomize(c.clockwise);
                    BoolConfigParam.Randomize(c.angle);
                    FloatConfigParam.Randomize(c.interval);

                }
                else if( freeModule.type == ModuleType.Perlin)
                {
                    const c:PerlinConfig = config as PerlinConfig;
                    FloatConfigParam.Randomize(c.amplitude);
                    FloatConfigParam.Randomize(c.frequency);
                    FloatConfigParam.Randomize(c.octaves);
                }
                else if( freeModule.type == ModuleType.Switch)
                {
                    const c:SwitchConfig = config as SwitchConfig;
                    FloatConfigParam.Randomize(c.interval);
                    BoolConfigParam.Randomize(c.combineRule);
                    BoolConfigParam.Randomize(c.start);
                }
                else if( freeModule.type == ModuleType.Rocket)
                {
                    const c:RocketConfig = config as RocketConfig;
                    FloatConfigParam.Randomize(c.power);
                    FloatConfigParam.Randomize(c.directionNoise);
                    FloatConfigParam.Randomize(c.powerNoise);
                    FloatConfigParam.Randomize(c.burn);
                    FloatConfigParam.Randomize(c.delay);
                }
                
            }
            
            lastModule = freeModule;
            placedModules++;
        }

        if( !this.isMachineValid())
        {
            this.addOneRandomDrawingElement();
        }

        this.grid.updateLinks(this.modules);
        Designer.OnModulesChanged();
    }

    buildBiggestMachine():void
    {
        
        const typeTable:ModuleType[] = [];
        for( let i:number = 0; i<4; i++)
            typeTable.push(ModuleType.Motor);
        for( let i:number = 0; i<2; i++)
            typeTable.push(ModuleType.WaveMod);

        typeTable.push(ModuleType.Block, ModuleType.Party, ModuleType.Spray, ModuleType.Rotator);

        for( let i:number = 0; i < this.modules.length; i++)
        {
            const m:Module = this.modules[i];
            const type:ModuleType = typeTable[Math.floor(Math.random() * typeTable.length)];
            m.type = type;
            const typenum:number = Object.values(ModuleType).indexOf(m.type);

            const vis:ModuleVis = new ModuleVis(typenum, m.type);
            const wpos:Vector3 = new Vector3();
            this.gridToWorld(m.position, wpos)
            vis.position.copy( wpos);
            this.moduleContainer.add(vis);
            vis.moduleRef = m;
            
            m.vis = vis;

            //const numo:number = Rand.iBetween(0, 3);
            const numo:number = Math.floor(Math.random() * 4);
            switch(numo)
            {
                case 0:
                    m.orientation = ModuleOrientation.Up;
                    break;
                case 1:
                    m.orientation = ModuleOrientation.Right;
                    break;
                case 2:
                    m.orientation = ModuleOrientation.Down;
                    break;
                case 3:
                    m.orientation = ModuleOrientation.Left;
                    break;
            }
        }
        this.grid.updateLinks(this.modules);
        Designer.OnModulesChanged();
    }

    BuildMachineFromData( data:any[]):void
    {
        this.clearAllBlocks(false);

        //console.log( "Length check for sanity : ", data.length, this.modules.length);
        for( let i:number = 0 ;i< this.modules.length; i++)
        {
            const mdata:any = data[i];
            const m:Module = this.modules[i];
            const type:ModuleType = ModuleType[Object.keys(ModuleType)[mdata.t] ];
            if(type==undefined) // empty module
            {
                m.type = ModuleType.Empty;
                continue;
            }
            m.type = type;
            
            //console.log( "Orientation : ", mdata.o, Object.keys(ModuleOrientation)[mdata.o] );
            //const orientation:ModuleOrientation = ModuleOrientation[Object.keys(ModuleOrientation)[mdata.o] ];
            const orientation:ModuleOrientation = mdata.o;
            m.orientation = orientation;

            const configOptions:[] = mdata.c;
            for( let j:number = 0 ; j< configOptions.length; j++)
            {
                const optStr:string = configOptions[j];
                //const val:number = parseInt( optStr.substring(2,3) );
                const val:number = parseInt( optStr );
                const param:ConfigParam = m.config[ Object.keys(m.config)[j] ];
                //console.log( "P=", optStr, param, val);
                if( param.type == "number")
                    param.value = val;
                else if( param.type == "boolean")
                    param.value = (val == 1);
                else if( param.type == "select")
                {
                    if( param.id == "shape")
                    {
                        const shape:ParticleShape = ParticleShape[Object.keys(ParticleShape)[val] ];
                        (param as SelectConfigParam).value = shape;
                    }
                    else if( param.id == "waveShape")
                    {
                        const shape:WaveShape = WaveShape[Object.keys(WaveShape)[val] ];
                        (param as SelectConfigParam).value = shape;
                    }
                    else if( param.id == "color")
                    {
                        const colormode:ColorMode = ColorMode[Object.keys(ColorMode)[val] ];
                        (param as SelectConfigParam).value = colormode;
                    }
                }
                //console.log( m.config[ Object.keys(m.config)[j] ]);
            }
            //console.log( mdata.t);
            const vis:ModuleVis = new ModuleVis(mdata.t, m.type);
            const wpos:Vector3 = new Vector3();
            this.gridToWorld(m.position, wpos)
            vis.position.copy( wpos);
            this.moduleContainer.add(vis);
            vis.moduleRef = m;
            
            m.vis = vis;
        }
        this.grid.updateLinks(this.modules);   
    }

    isMachineValid():boolean // need to have at least one drawing element
    {
        for( let i:number = 0; i< this.modules.length; i++)
        {
            const m:Module = this.modules[i];
            switch(m.type)
            {
                case ModuleType.Party:
                    return true;
                case ModuleType.Spray:
                    return true;
                default:
                    break;
            }
        }
    }

    addOneRandomDrawingElement():void
    {
        // check is the machine is full 
        let isFull:boolean = true;
        for( let i:number = 0; i< this.modules.length; i++)
        {
            if( this.modules[i].type == ModuleType.Empty)
            {
                isFull = false;
                break;
            }
        }

        if( isFull)
        {
            console.log( "Machine is full");
            return;
        }

        // find a random empty module adjacent to a non empty one
        let freemodule:Module = null;
        while( freemodule == null)
        {
            const index:number = Math.floor(Math.random() * this.modules.length);
            const m:Module = this.modules[index];
            if( m.type == ModuleType.Empty)
                continue;
            const neighbours:Module[] = this.getEmptyNeighbours(m);
            if( neighbours.length == 0)
                continue;
            
            // pick a random neighbour
            const n:Module = neighbours[ Math.floor(Math.random() * neighbours.length) ];
            freemodule = n;

        }

        const m:Module = freemodule;
        // add a random drawing element
        const typeTable:ModuleType[] = [ModuleType.Party, ModuleType.Spray];
        const type:ModuleType = typeTable[Math.floor(Math.random() * typeTable.length)];
        m.type = type;
        const typenum:number = Object.values(ModuleType).indexOf(m.type);
        
        const vis:ModuleVis = new ModuleVis(typenum, m.type);
        const wpos:Vector3 = new Vector3();
        this.gridToWorld(m.position, wpos)
        vis.position.copy( wpos);
        this.moduleContainer.add(vis);
        vis.moduleRef = m;
        m.vis = vis;

    }

    getEmptyNeighbours(m: Module): Module[] {

        // check the four cardinal directions for neighbours
        const neighbours:Module[] = [];
        const p:Vector2 = m.position;
        if( p.x -1 >= 0)
        {
            const left:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x-1, p.y))];
            if( left.type == ModuleType.Empty)
            neighbours.push( left );
        }
        if( p.x +1 < Designer.SPACE_SIZE)
        {
            const right:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x+1, p.y))];
            if( right.type == ModuleType.Empty)
            neighbours.push( right );
        }
        if( p.y -1 >= 0)
        {
            const down:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x, p.y-1))];
            if( down.type == ModuleType.Empty)
            neighbours.push( down );
        }
        if( p.y +1 < Designer.SPACE_SIZE)
        {
            const up:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x, p.y+1))];
            if( up.type == ModuleType.Empty)
            neighbours.push( up );
        }        

        return neighbours;
        
    }


    checkCursorAvailability():boolean
    {
        //console.log( "checkCursorAvailability : ", isModuleMenuOpen(), hasAnyMenuOpen(), isOnboardingOpen() );
        return (
            !isModuleMenuOpen() 
            && !hasAnyMenuOpen()
            && !isOnboardingOpen()
        )
    }
}

class SmokePart
{
    position:Vector3 = new Vector3();
    rotation:number = 0 ;
    alpha:number = 0;
    size:number = 0;
    life:number = 0;
    velocity:Vector3 = new Vector3();
}

export {Build};