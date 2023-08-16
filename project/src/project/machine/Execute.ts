import { BufferGeometry, Color, DynamicDrawUsage, Group,InstancedMesh,Mesh,MeshBasicMaterial,Object3D,PlaneGeometry,Vector2 } from "three";

import { Collider, ColliderDesc, JointData, RigidBody, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Vector2 as WVector2} from "@dimforge/rapier2d";
import { Module, ModuleType } from "./structs/Module";
import { Designer } from "../Designer";
import { Project } from "../Project";
import {updatePlayerProgress, isRunUIVisible, setRunUIVisible, setExeInstance} from "../react/RunUI";
import { IElement } from "./elements/IElement";
import { Motor } from "./elements/Motor";
import { Palette } from "./Palette";
import { PRibbon } from "./elements/PRibbon";
import { Weight } from "./elements/Weight";
import { ParticleSpray } from "./elements/ParticleSpray";
import { RandTexGen } from "../../helpers/RandTexGen";
import { PerlinMod } from "./elements/PerlinMod";
import { Rocket } from "./elements/Rocket";
import { Build } from "./Build";
import { Stamp } from "./elements/Stamp";


enum ExecuteState
{
    Hidden,
    Init,
    Ready, 
    Paused,
    Playing,
    Stopped,
}

class Execute extends Group
{
    static instance:Execute;
    static worldSize:Vector2 = new Vector2(100,100);
    static hWorldSize:Vector2 = new Vector2(Execute.worldSize.x/2,Execute.worldSize.y/2);
    state:ExecuteState = ExecuteState.Init;
    world:World;
    worldWrap:boolean = false;
    autoStart:boolean = true;
    visible: boolean = false;

    useSingleRb:boolean = true;
    groupRBs:RigidBody[] = [];

    stepCount:number = 0;
    modules:Module[];
    activeModules:Module[] = [];
    groups:Module[][];

    backgroundMaterial:MeshBasicMaterial;
    backgroundMesh:Mesh;
    borderMask:Group;

    static USER_INACTIVITY_TIMEOUT:number = 3000;
    lastUserInteractionTime:number = 0 ;
    
    constructor(modules:Module[])
    {
        super();
        
        Execute.instance = this;
        setExeInstance( this );
        this.modules = modules;
        
        this.initBG();
        
        //if( Project.GetContext() != FXContext.CAPTURE)
        this.initDOMEvents();

    }

    calcProgress():number
    {
        if( this.elements.length == 0 )
            return 0;
        let progress:number = 0;
        let hits:number = 0 ;
        for( let i:number = 0 ;i< this.elements.length; i++)
        {
            const mod:IElement = this.elements[i] ;
            if( mod.isDrawingElement)
            {
                progress += mod.getProgress();
                hits++;
            }

        }

        if( hits > 0 )
        {
            progress /= hits;
        }
        return progress ;
    }

    play()
    {
        if( this.state >= ExecuteState.Ready)
        {
            this.state = ExecuteState.Playing;
        }
    }

    pause()
    {
        if( this.state >= ExecuteState.Ready)
        {
            this.state = ExecuteState.Paused;
        }
    }
    stop()
    {
        if( this.state >= ExecuteState.Ready)
        {
            this.ResetSim();
            this.state = ExecuteState.Paused;
        }
    }

    borderMaterial:MeshBasicMaterial;
    overflowMaterial:MeshBasicMaterial;
    // a background, a frame, and a mask for the overflow
    initBG()
    {
        const bw:number = 1 ;
        const hbw:number = bw/2;
        const overflowW:number = 200;
        const bgCol:Color = Palette.background == undefined? new Color(0x000000) : Palette.background;
        const bodyCol:Color = new Color(0x242424).convertLinearToSRGB();;
        
        if( this.backgroundMesh == undefined)
        {
            this.overflowMaterial = new MeshBasicMaterial({color:bodyCol});
            
            const bgMat:MeshBasicMaterial = new MeshBasicMaterial({color:bgCol, transparent:false, forceSinglePass:true});
            this.borderMaterial = new MeshBasicMaterial({color:bgCol.clone().offsetHSL(0,0,0.1)});
            this.backgroundMaterial = bgMat;

            const bgMesh:Mesh = new Mesh(new PlaneGeometry(Execute.worldSize.x, Execute.worldSize.y), bgMat);
            bgMesh.position.set(0,0, -15);
            super.add(bgMesh);
            this.backgroundMesh = bgMesh;

            
            this.borderMask = new Group();
            this.borderMask.position.set( 0, 0, 5);
            super.add(this.borderMask);

            const borderGeom:BufferGeometry = new PlaneGeometry(Execute.worldSize.x , bw);
            const top:Mesh = new Mesh(borderGeom, this.borderMaterial);
            top.position.set(0,Execute.hWorldSize.y - hbw, 1);
            this.borderMask.add(top);
            const bottom:Mesh = new Mesh(borderGeom, this.borderMaterial);
            bottom.position.set(0,-Execute.hWorldSize.y  + hbw, 1);
            this.borderMask.add(bottom);
            const borderGeom2:BufferGeometry = new PlaneGeometry(bw, Execute.worldSize.y );
            const left:Mesh = new Mesh(borderGeom2, this.borderMaterial);
            left.position.set(-Execute.hWorldSize.x + hbw,0, 1);
            this.borderMask.add(left);
            const right:Mesh = new Mesh(borderGeom2, this.borderMaterial);
            right.position.set(Execute.hWorldSize.x - hbw,0, 1);
            this.borderMask.add(right);

            const overflowGeom:BufferGeometry = new PlaneGeometry(Execute.worldSize.x + overflowW *2 , overflowW);
            const oTop:Mesh = new Mesh(overflowGeom, this.overflowMaterial);
            oTop.position.set(0,Execute.hWorldSize.y + overflowW * .5 , .9);
            this.borderMask.add(oTop);
            const oBottom:Mesh = new Mesh(overflowGeom, this.overflowMaterial);
            oBottom.position.set(0,-Execute.hWorldSize.y - overflowW * .5 , .9);
            this.borderMask.add(oBottom);
            const overflowGeom2:BufferGeometry = new PlaneGeometry(overflowW, Execute.worldSize.y + overflowW *2);
            const oLeft:Mesh = new Mesh(overflowGeom2, this.overflowMaterial);
            oLeft.position.set(-Execute.hWorldSize.x - overflowW * .5,0, .9);
            this.borderMask.add(oLeft);
            const oRight:Mesh = new Mesh(overflowGeom2, this.overflowMaterial);
            oRight.position.set(Execute.hWorldSize.x + overflowW * .5,0, .9);
            this.borderMask.add(oRight);
            
        }
        else 
        {
            this.backgroundMaterial.color.copy(Palette.background);
            this.backgroundMesh.geometry.dispose();
            this.backgroundMesh.geometry = new PlaneGeometry(Execute.worldSize.x, Execute.worldSize.y);
            //this.borderMaterial.color.copy(Palette.background.clone().offsetHSL(0.0,0.0,0.2));
            this.borderMaterial.color.copy(Palette.background.clone().offsetHSL(0.0,0.0,0.1));
            //this.borderMaterial.color.set(1,0,0);
            while( this.borderMask.children.length > 0)
            {
                const child:Mesh = this.borderMask.children[0] as Mesh;
                child.geometry.dispose();
                this.borderMask.remove(child);

            }
            const borderGeom:BufferGeometry = new PlaneGeometry(Execute.worldSize.x , bw);
            const top:Mesh = new Mesh(borderGeom, this.borderMaterial);
            top.position.set(0,Execute.hWorldSize.y - hbw, 1);
            this.borderMask.add(top);
            const bottom:Mesh = new Mesh(borderGeom, this.borderMaterial);
            bottom.position.set(0,-Execute.hWorldSize.y + hbw, 1);
            this.borderMask.add(bottom);
            const borderGeom2:BufferGeometry = new PlaneGeometry(bw, Execute.worldSize.y );
            const left:Mesh = new Mesh(borderGeom2, this.borderMaterial);
            left.position.set(-Execute.hWorldSize.x + hbw,0, 1);
            this.borderMask.add(left);
            const right:Mesh = new Mesh(borderGeom2, this.borderMaterial);
            right.position.set(Execute.hWorldSize.x - hbw,0, 1);
            this.borderMask.add(right);

            const overflowGeom:BufferGeometry = new PlaneGeometry(Execute.worldSize.x + overflowW *2, overflowW);
            const oTop:Mesh = new Mesh(overflowGeom, this.overflowMaterial);
            oTop.position.set(0,Execute.hWorldSize.y + overflowW * .5 , .9);
            this.borderMask.add(oTop);
            const oBottom:Mesh = new Mesh(overflowGeom, this.overflowMaterial);
            oBottom.position.set(0,-Execute.hWorldSize.y - overflowW * .5 , .9);
            this.borderMask.add(oBottom);
            const overflowGeom2:BufferGeometry = new PlaneGeometry(overflowW, Execute.worldSize.y + overflowW *2);
            const oLeft:Mesh = new Mesh(overflowGeom2, this.overflowMaterial);
            oLeft.position.set(-Execute.hWorldSize.x - overflowW * .5,0, .9);
            this.borderMask.add(oLeft);
            const oRight:Mesh = new Mesh(overflowGeom2, this.overflowMaterial);
            oRight.position.set(Execute.hWorldSize.x + overflowW * .5,0, .9);
            this.borderMask.add(oRight);
        }
        
       
        
    }


    initDOMEvents()
    {
        // need some listeners to hide the UI after the user is inactive for some time
        document.addEventListener("mousemove", this.handleActivityEvent.bind(this));
        document.addEventListener("mousedown", this.handleActivityEvent.bind(this));
        document.addEventListener("mouseup", this.handleActivityEvent.bind(this));
        document.addEventListener("wheel", this.handleActivityEvent.bind(this));
        document.addEventListener("touchstart", this.handleActivityEvent.bind(this));
    }

    handleActivityEvent(event)
    {
        this.lastUserInteractionTime = performance.now();
        
        if( !isRunUIVisible())
        {
            setRunUIVisible(true);
            Build.instance.moduleContainer.visible = true;
        }
        
    }
    
    show()
    {
        
        Project.ResetRand();
        RandTexGen.GenerateTex();
        this.initBG();
        this.initWorld();
        this.PopulateActiveModules();
        this.SetModuleGroups();
        this.CreatePhysics();
        this.CreateElements();
        this.updateModules(0,0);
        this.updateUI();
        this.visible = true;
        this.state = ExecuteState.Ready;

        if( this.autoStart)
            this.state = ExecuteState.Playing;
            
    }

    hide()
    {
        
        this.state = ExecuteState.Hidden;
        this.cleanWorld();
        this.resetModules();
        this.visible = false;
    }

    ResetSim()
    {
        this.state = ExecuteState.Init;
        this.cleanWorld();
        this.resetModules();

        Project.ResetRand();
        RandTexGen.GenerateTex();
        this.initBG();
        this.initWorld();
        this.PopulateActiveModules();
        this.SetModuleGroups();
        this.CreatePhysics();
        this.CreateElements();
        this.updateModules(0,0);
        this.updateUI();
        this.state = ExecuteState.Ready;
        
    }

    initWorld()
    {
        
        const RAPIER = Project.instance.RAPIER;
        
        //this.world = new RAPIER.World(new WVector2(0,0));
        this.world = new RAPIER.World({x:0, y:0});
        this.addWalls();
        this.stepCount = 0 ;
        
    }

    PopulateActiveModules()
    {
        
        this.activeModules = [];
        for( let i:number = 0 ;i< this.modules.length; i++)
        {
            const m:Module = this.modules[i];
            if( m.type != ModuleType.Empty)
                this.activeModules.push(m);
        }
        
    }

    SetModuleGroups()
    {
        
        // do a depth first search for module groups, and assign them a group id. Two modules are in the same group if they are orthognally adjacent to each other.
        // each module can only be in one group.
        // if a module is not in a group, it is a single module group.

        
        const groups:Module[][] = [];
        const visited:boolean[] = [];
        for( let i:number = 0 ;i< this.activeModules.length; i++)
        {
            visited[i] = false;
        }

        const stack:Module[] = [];
        for( let i:number = 0 ;i< this.activeModules.length; i++)
        {
            const m:Module = this.activeModules[i];
            if( !visited[i])
            {
                stack.push(m);
                const newGroup:Module[] = [];
                while( stack.length > 0)
                {
                    const top:Module = stack.pop();
                    const index:number = this.activeModules.indexOf(top);
                    if( !visited[index])
                    {
                        visited[index] = true;
                        newGroup.push(top);
                        const neighbours:Module[] = this.getNeighbours(top);
                        for( let n:number = 0 ;n< neighbours.length; n++)
                        {
                            const neighbour:Module = neighbours[n];
                            const neighbourIndex:number = this.activeModules.indexOf(neighbour);
                            if( !visited[neighbourIndex])
                            {
                                stack.push(neighbour);
                            }
                        }
                    }
                }
                groups.push(newGroup);
            }
        }
        this.groups = groups;
        
    }

    getNeighbours(m: Module): Module[] {

        
        // check the four cardinal directions for neighbours
        const neighbours:Module[] = [];
        const p:Vector2 = m.position;
        if( p.x -1 >= 0)
        {
            const left:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x-1, p.y))];
            if( left.type != ModuleType.Empty)
            neighbours.push( left );
        }
        if( p.x +1 < Designer.SPACE_SIZE)
        {
            const right:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x+1, p.y))];
            if( right.type != ModuleType.Empty)
            neighbours.push( right );
        }
        if( p.y -1 >= 0)
        {
            const down:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x, p.y-1))];
            if( down.type != ModuleType.Empty)
            neighbours.push( down );
        }
        if( p.y +1 < Designer.SPACE_SIZE)
        {
            const up:Module = this.modules[this.gridToModuleIndex(new Vector2(p.x, p.y+1))];
            if( up.type != ModuleType.Empty)
            neighbours.push( up );
        }        

        return neighbours;
        
    }

    addWalls()
    {
        const RAPIER = Project.instance.RAPIER;

        const collisionMask:number =  0x0001FFFD;// 0b0000_0000_0000_0001 // 0b1111_1111_1111_1100
        const restitutionCoeff:number = 2; 
        const wallW:number = 10;
        
        const topWall:ColliderDesc = RAPIER.ColliderDesc.cuboid(Execute.hWorldSize.x, wallW).setRestitution(restitutionCoeff).setCollisionGroups(collisionMask);
        //const topWall:ColliderDesc = ColliderDesc.cuboid(7, 2);//.setRestitution(.4).setCollisionGroups(.1);
        topWall.setTranslation(0, Execute.hWorldSize.y + wallW);
        this.world.createCollider(topWall);
        
        const bottomWall:ColliderDesc = RAPIER.ColliderDesc.cuboid(Execute.hWorldSize.x, wallW).setRestitution(restitutionCoeff).setCollisionGroups(collisionMask);
        bottomWall.setTranslation(0, -Execute.hWorldSize.y - wallW);
        this.world.createCollider(bottomWall);

        const leftWall:ColliderDesc = RAPIER.ColliderDesc.cuboid(wallW, Execute.hWorldSize.y).setRestitution(restitutionCoeff).setCollisionGroups(collisionMask);
        leftWall.setTranslation(-Execute.hWorldSize.x -wallW, 0);
        this.world.createCollider(leftWall);

        const rightWall:ColliderDesc = RAPIER.ColliderDesc.cuboid(wallW, Execute.hWorldSize.y).setRestitution(restitutionCoeff).setCollisionGroups(collisionMask);
        rightWall.setTranslation(Execute.hWorldSize.x  +wallW, 0);
        this.world.createCollider(rightWall);
        
        
    }

    cleanWorld()
    {
        
        for( let i:number = 0 ;i< this.activeModules.length; i++)
        {
            const m:Module = this.activeModules[i];
            m.rb = null;
        }
        this.world.free();
        this.world = null;
        
    }

    resetModules()
    {
        
        for( let i:number = 0 ;i< this.activeModules.length; i++)
        {
            const m:Module = this.activeModules[i];
            if( m.type != ModuleType.Empty)
            {
                const pos:Vector2 = this.gridToWorld(m.position);
                m.vis.position.set(pos.x, pos.y, 0);
                m.vis.targetPosition.set(pos.x, pos.y, 0);
                m.vis.resetRotation();
                m.element = null;
                m.mods = [];
                m.vis.updateMatrix();
                m.vis.updateMatrixWorld();
            }
        } 
        this.resetElements();
        

    }

    resetElements()
    {
        
        for(let i:number = 0; i< this.elements.length; i++) 
        {
            const de:IElement = this.elements[i];
            if( de == null)
                continue;
            
            de.dispose();
            super.remove(de);
        }
        
    }

    CreatePhysics()
    {
        const RAPIER = Project.instance.RAPIER;
        
        const defaultColliderMass:number = .5;
        // col group 1 collides only with itself// and walls
        const colliderDesc:ColliderDesc = RAPIER.ColliderDesc.cuboid(.5,.5).setRestitution(1).setCollisionGroups(0x00020002).setMass(.1);
        const startOffset:Vector2 = Execute.worldSize.clone().multiply(Designer.instance.launchPosition);
        if( !this.useSingleRb) // create a rigid body for each module - not used anymore, but was interesting. 
        {
            /*
            for( let i:number = 0 ;i< this.activeModules.length; i++)
            {
                const m:Module = this.activeModules[i];

                const pos:Vector2 = this.gridToWorld(m.position);
                const rbdesc:RigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                    .setTranslation(pos.x, pos.y)
                    .setAngularDamping(5)
                    .setLinearDamping(1);
                const rb:RigidBody = this.world.createRigidBody(rbdesc);

                if( m.type == ModuleType.Block)
                {
                    rb.setAdditionalMass(1, false);
                }
                else if( m.type == ModuleType.Motor)
                {
                    rb.setAdditionalMass(0.5, false);
                }
                else 
                {
                    rb.setAdditionalMass(0.25, false);
                }


                this.world.createCollider(colliderDesc, rb);
                m.rb = rb;

                if( m.position.x >0)
                {
                    const left:Module = this.modules[this.gridToModuleIndex(new Vector2(m.position.x-1, m.position.y))];
                    if( left.type != ModuleType.Empty)
                    {
                        const j:JointData = RAPIER.JointData.fixed({ x: -0.5, y: 0.0 }, 0.0, { x: 0.5, y: 0.0 }, 0.0);
                        this.world.createImpulseJoint(j, rb, left.rb, true);
                    }
                }
                if( m.position.y >0)
                {
                    const down:Module = this.modules[this.gridToModuleIndex(new Vector2(m.position.x, m.position.y-1))];
                    if( down.type != ModuleType.Empty)
                    {
                        const j:JointData = RAPIER.JointData.fixed({ x: 0.0, y: -0.5 }, 0.0, { x: 0.0, y: 0.5 }, 0.0);
                        this.world.createImpulseJoint(j, rb, down.rb, true);
                    }
                }

                const neighbours:Module[] = this.getNeighbours(m);
                for( let j:number = 0; j< neighbours.length; j++)
                {
                    const n:Module = neighbours[j];
                    if( n.type == ModuleType.WaveMod)
                    {
                        m.mods.push(n);
                    }
                }
            }*/
        }
        else // create a single rigid body for each group
        {
            this.groupRBs = [];
            for( let i:number =0;i<this.groups.length; i++)
            {
                const g:Module[] = this.groups[i];
                // calculate barycenter of the group
                let barycenter:Vector2 = new Vector2(0,0);
                let mass:number = 0;
                
                const rbdesc:RigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
                    .setAngularDamping(10)
                    .setLinearDamping(5);                
                
                for( let j:number = 0; j< g.length; j++)
                {
                    const m:Module = g[j];
                    const pos:Vector2 = this.gridToWorld(m.position).add(startOffset);

                    //pos.x += Execute.worldSize.x * Designer.instance.launchPosition.x;
                    //pos.y += Execute.worldSize.y * Designer.instance.launchPosition.y;

                    barycenter = barycenter.add(pos);
                    mass += 1;
                }
                
                barycenter = barycenter.multiplyScalar(1/mass);

                rbdesc.setTranslation(barycenter.x, barycenter.y);
                const rb:RigidBody = this.world.createRigidBody(rbdesc);
                this.groupRBs.push(rb);
                for( let j:number = 0; j< g.length; j++)
                {
                    const m:Module = g[j];
                    m.rb = rb;
                    //m.visOffset.copy(this.gridToWorld(m.position)).sub(barycenter).add(Execute.worldSize.clone().multiply(Designer.instance.launchPosition));
                    m.visOffset.copy(this.gridToWorld(m.position)).sub(barycenter).add(startOffset);
                    const pos:Vector2 = this.gridToWorld(m.position).add(startOffset);
                    
                    //pos.x += Execute.worldSize.x * Designer.instance.launchPosition.x;
                    //pos.y += Execute.worldSize.y * Designer.instance.launchPosition.y;
                    

                    colliderDesc.setTranslation(pos.x - barycenter.x ,pos.y - barycenter.y);
                    const massValue:number = m.config.mass.options.min +  m.config.mass.value*.1 * (m.config.mass.options.max - m.config.mass.options.min);
                    //console.log("mass", massValue, m.config.mass.value, m.config.mass.options.min, m.config.mass.options.max);
                    colliderDesc.setMass(massValue || defaultColliderMass);
                    const c:Collider = this.world.createCollider(colliderDesc, rb);
                    m.collider = c;

                    const neighbours:Module[] = this.getNeighbours(m);
                    for( let k:number = 0; k< neighbours.length; k++)
                    {
                        const n:Module = neighbours[k];
                        if( n.type == ModuleType.WaveMod 
                            || n.type == ModuleType.Rotator 
                            || n.type == ModuleType.Perlin 
                            || n.type == ModuleType.Switch)
                        {
                            m.mods.push(n);
                        }
                    }
                }
                rb.recomputeMassPropertiesFromColliders();
            }
        }
        
    }


    elements:IElement[];
    CreateElements()
    {
        
        this.elements = [];

        for( let i:number = 0 ;i< this.activeModules.length; i++)
        {
            const m:Module = this.activeModules[i];
            let el:IElement = null;
            
            if( m.type == ModuleType.Block)
            {
                el = new Weight(m, this.world);
            }
            
            else if( m.type == ModuleType.Motor)
            {
                el = new Motor(m, this.world); 
            }
            
            else if( m.type == ModuleType.Party)
            {
                //el = new PartyStream(m, this.world);
                el = new PRibbon(m, this.world);
                //el = new MLRibbon(m, this.world);
            }
            
            else if( m.type == ModuleType.Spray)
            {
                //el = new OutlineParts(m, this.world);
                el = new ParticleSpray(m, this.world);
            }
            
            else if( m.type == ModuleType.Perlin)
            {
                el = new PerlinMod(m);
            }
            else if( m.type == ModuleType.Rocket)
            {
                el = new Rocket(m, this.world);
            }
            else if( m.type == ModuleType.Stamp)
            {
                el = new Stamp(m);
            }
            /*
            else if( m.type == ModuleType.Ribbon)
            {
                el = new Ribbon(m);
            }
            */
            
            if( el != null)
            {
                m.element = el;
                this.elements.push(el);
                super.add( el ) ;
            }
        }
        
    }

    gridToWorld(p:Vector2):Vector2
    {
        const hs:number = Math.floor( Designer.SPACE_SIZE/2 );
        return new Vector2(p.x - hs, p.y - hs);
    }

    gridToModuleIndex(pos:Vector2):number
    {
        const index:number = pos.x + pos.y * Designer.SPACE_SIZE;
        return index;
    }

    update( dt:number, elapsed:number)
    {
        if( this.state < ExecuteState.Ready ) 
            return;
        
        if( this.state === ExecuteState.Playing)
        {
            const progress:number = this.calcProgress();
            
            if(progress < 1)
                this.simulationStep(dt, elapsed);

            this.updateUI();
        }
        
        if( performance.now() - this.lastUserInteractionTime  > Execute.USER_INACTIVITY_TIMEOUT && isRunUIVisible() )
        {
            setRunUIVisible(false);
            Build.instance.moduleContainer.visible = false;
        }
        
    }

    simulationStep(dt:number, elapsed:number)
    {
        if( this.world != undefined)
            this.world.step();
        
        this.stepCount++;
        this.updateModules(dt, elapsed);
    }

    updateUI()
    {
        updatePlayerProgress( this.calcProgress() );
    }

    updateModules(dt:number, elapsed:number)
    {
        //let wwCount:number = 0;
        //let pcount:number = 0;

        for( let i:number =0 ;i< this.activeModules.length; i++)
        {
            const m:Module = this.activeModules[i];
            
            if( m.vis!=null)
            {
                m.vis.update(dt, elapsed);
            }

            /*
            pcount++;
            if( this.isOOB(m.rb))
                wwCount++;*/

            this.updateVisFromRb(m);
            //const rb:RigidBody = m.rb;
            if( this.elements==undefined || i>this.elements.length)
                continue;
            
            const el:IElement = this.elements[i];
            if( el != null)
            {
                el.update(dt, elapsed);
            }
        }

        this.wrapModules();
    }

    wrapModules()
    {
        if( !this.useSingleRb)
        {
            for( let i:number = 0 ;i< this.groups.length; i++)
            {
                const bari:Vector2 = new Vector2();
                const g:Module[] = this.groups[i];
                for( let j:number =0 ;j< g.length; j++)
                {
                    bari.x += g[j].rb.translation().x;
                    bari.y += g[j].rb.translation().y;
                }

                bari.multiplyScalar(1/g.length);
                let lr:number = 0 ;
                let ud:number = 0;
                if( this.isOOBV(bari) )
                {
                    const sx:number = Execute.hWorldSize.x;
                    const sy:number = Execute.hWorldSize.y;
                    if( bari.x > sx)
                        lr = -Execute.worldSize.x;
                    else if( bari.x < -sx)
                        lr = Execute.worldSize.x;

                    if( bari.y > sy)
                        ud = -Execute.worldSize.y;
                    else if( bari.y < -sy)
                        ud = Execute.worldSize.y;
                    
                    for( let j:number =0 ;j< g.length; j++)
                    {
                        const rb:RigidBody = g[j].rb;
                        const pos:WVector2 = rb.translation();
                        rb.setTranslation({x:pos.x + lr, y:pos.y + ud}, true);
                    }
                }
            }
        }
        else 
        {
            for( let i:number = 0 ;i< this.groups.length; i++)
            {
                const rb:RigidBody = this.groupRBs[i];
                if( rb == null)
                    continue;
                
                const bari:Vector2 = new Vector2(rb.translation().x, rb.translation().y);
                if( this.isOOBV(new Vector2(rb.translation().x, rb.translation().y)) )
                {
                    const sx:number = Execute.hWorldSize.x;
                    const sy:number = Execute.hWorldSize.y;
                    let lr:number = 0 ;
                    let ud:number = 0;

                    if( bari.x > sx)
                        lr = -Execute.worldSize.x;
                    else if( bari.x < -sx)
                        lr = Execute.worldSize.x;

                    if( bari.y > sy)
                        ud = -Execute.worldSize.y;
                    else if( bari.y < -sy)
                        ud = Execute.worldSize.y;

                    rb.setTranslation({x:rb.translation().x + lr, y:rb.translation().y + ud}, true);
                }
            }
        }
    }

    updateVisFromRb(m:Module)
    {
        if( m.rb == null || m.vis == null)
            return;
        
        if( !this.useSingleRb)
        {
            m.vis.position.x = m.rb.translation().x;
            m.vis.position.y = m.rb.translation().y;
            m.vis.rotation.z = m.rb.rotation();
        }
        else 
        {
            const off:Vector2 = m.visOffset.clone();
            off.rotateAround(new Vector2(), m.rb.rotation());
            m.vis.position.x = m.rb.translation().x + off.x;
            m.vis.position.y = m.rb.translation().y + off.y;
            m.vis.rotation.z = m.rb.rotation();
        }
    }

    isOOB(rb):boolean
    {
        // return true if the rigid body is outside the world
        const pos:Vector2 = rb.translation();
        return this.isOOBV(pos);
    }

    isOOBV(v:Vector2):boolean
    {
        // return true if the rigid body is outside the world
        const sx:number = Execute.hWorldSize.x;
        const sy:number = Execute.hWorldSize.y;        
        return ( v.x > sx || v.x < -sx || v.y > sy || v.y < -sy);
    }

    
    static wrapRb(rb:RigidBody)
    {
        let px:number = rb.translation().x;
        let py:number = rb.translation().y;
        const sx:number = Execute.hWorldSize.x;
        const sy:number = Execute.hWorldSize.y;
        if( px > sx)
            px -= Execute.worldSize.x;
        else if( px < -sx)
            px += Execute.worldSize.x;
        if( py > sy)
            py -= Execute.worldSize.y;
        else if( py < -sy)
            py += Execute.worldSize.y;
        
        rb.setTranslation({x:px, y:py}, true);
    }

}

export {Execute};