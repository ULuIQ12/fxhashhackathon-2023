import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Curve, DynamicDrawUsage, Float32BufferAttribute, Group, Material, MathUtils, Matrix4, Mesh, Vector2, Vector3 } from "three";
import { IElement } from "./IElement";
import { ColorMode, Module, ModuleType, PerlinConfig, RibbonConfig, RotatorConfig, SwitchConfig, WaveConfig, WaveShape } from "../structs/Module";
import { CoefficientCombineRule, Collider, ColliderDesc, RigidBody, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Rand } from "../../../helpers/Rand";
import { Palette } from "../Palette";
import { RibbonMaterial } from "../materials/RibbonMaterial";
import { Execute } from "../Execute";
import { Rotator } from "./Rotator";
import { Project } from "../../Project";
import { PerlinMod } from "./PerlinMod";
import { WaveMod } from "./WaveMod";
import { SwitchElem } from "./SwitchElem";


class RibbonPart
{
    rb:RigidBody;
    depth:number = 0;
    width:number = 1;
    deathPosition:Vector2 = new Vector2(1000,1000);
    isOn:boolean = true;
    collider:Collider;
}

class PRibbon extends Group implements IElement
{
    module: Module;
    world:World;

    width:number = 1 ;
    stepCounter:number = 0;
    maxSteps:number = 1500;
    geometry:BufferGeometry;
    material:Material;
    TAU:number = Math.PI * 2;
    spawnTiming:number = -1; // -1 = every frame, otherwise every n frames
    spawnCounter:number = 0;

    color:Color;// = Rand.option( Palette.colors );

    period:number;// = Rand.iBetween(1, 20);

    particles:RibbonPart[] = [];

    collisionWalls:number = 0x00080001;
    collisionSelfAndWalls:number = 0x00080009;
    useColliders:boolean = true;

    

    constructor(m:Module, w:World)
    {
        super();

        this.module = m;
        this.world = w;
        
        this.init();
    }
    isDrawingElement: boolean = true;
    getProgress(): number {
        return this.stepCounter/this.maxSteps;
    }

    init()
    {
        this.stepCounter = 0;
        this.spawnCounter = 0;
        this.particles = [];
        this.useColliders = (this.module.config as RibbonConfig).enableCollision.value;
        this.initMesh();
    }

    initMesh()
    {
        const g:BufferGeometry = new BufferGeometry();
        this.geometry = g;

        const config:RibbonConfig = this.module.config as RibbonConfig;
        this.color = new Color();

        if( config.color.value == ColorMode.Random)
            this.color.copy( Rand.option( Palette.colors ) );
        else if( config.color.value != ColorMode.Rotating)
        {
            const c:number = Object.values(ColorMode).indexOf( config.color.value as ColorMode) - 2;
            this.color.copy(Palette.colors[c]);
        }
        else 
        {
        }
        const verts:number[] = [];
        const colors:number[] = [];
        const alphas:number[] = [];
        const indices:number[] = [];
        const widths:number[] = [];
        const uvs:number[] = [];
        
        for( let i:number = 0;i<this.maxSteps*2;i++)
        {
            // two vertices per step
            verts.push(0,0,0,0,0,0);
            colors.push(this.color.r,this.color.g,this.color.b,this.color.r,this.color.g, this.color.b);
            alphas.push(0,0);

            const v:number = i/(this.maxSteps*2-2); // uv.y along the totla length of the ribbon
            uvs.push(0,v,1,v);

            widths.push(0,0);

            if( i==0)
                continue;
            
            const index:number = i*2;       
            indices.push(index-2, index-1, index, index, index-1, index+1);
        }
        g.setIndex(indices);
        g.setAttribute("position", new Float32BufferAttribute(verts, 3).setUsage(DynamicDrawUsage));
        g.setAttribute("color", new Float32BufferAttribute(colors, 3).setUsage(DynamicDrawUsage));
        g.setAttribute("alpha", new Float32BufferAttribute(alphas, 1).setUsage(DynamicDrawUsage));
        g.setAttribute("width", new Float32BufferAttribute(widths, 1).setUsage(DynamicDrawUsage));
        g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

        let nump:number = 0 ;
        let pFreq:number = 0 ;
        let pOct:number = 0;
        let pAmp:number = 0;

        for( let i:number = 0 ;i< this.module.mods.length; i++)
        {
            const mod:Module = this.module.mods[i];
            if( mod.type == ModuleType.Perlin)
            {
                const pmod:PerlinConfig = mod.config as PerlinConfig;
                nump++;

                pFreq += pmod.frequency.options.min +  pmod.frequency.value*1/9 * (pmod.frequency.options.max - pmod.frequency.options.min);
                pOct += pmod.octaves.options.min +  pmod.octaves.value*1/9 * (pmod.octaves.options.max - pmod.octaves.options.min);
                pAmp += pmod.amplitude.options.min +  pmod.amplitude.value*1/9 * (pmod.amplitude.options.max - pmod.amplitude.options.min);                
            }
        }

        if( nump > 0 )
        {
            pFreq /= nump;
            pOct = Math.round( pOct/ nump);
            pAmp /= nump;
            //console.log("pFreq", pFreq, "pOct", pOct, "pAmp", pAmp);
            this.material = new RibbonMaterial({color:0xFFFFFF, transparent:true, vertexColors:true, wireframe:false}, {frequency:pFreq, octaves:pOct, amplitude:pAmp});
        }
        else 
        {
            this.material = new RibbonMaterial({color:0xFFFFFF, transparent:true, vertexColors:true, wireframe:false});
        }

        //this.material = new RibbonMaterial({color:0xFFFFFF, transparent:true, vertexColors:true, wireframe:false});
        const mesh = new Mesh(g, this.material);
        mesh.position.z = -1;
        mesh.frustumCulled = false;
        super.add(mesh);
    }

    update(dt: number, elapsed: number): void
    {        
        if( this.stepCounter < this.maxSteps && !this.isOOBV() )
        {
            if(this.spawnTiming != -1)
            {
                if( this.spawnCounter%this.spawnTiming==0)
                    this.launchParticle();
                this.spawnCounter++;
            }
            else 
                this.launchParticle();            
        }

        this.updateMesh();

    }

    lines:Vector3[][] = [];
    widths:number[][] = [];
    onOffs:boolean[][] = [];
    v0:Vector3 = new Vector3();
    v1:Vector3 = new Vector3();
    v2:Vector3 = new Vector3();
    v3:Vector3 = new Vector3();
    v4:Vector3 = new Vector3();
    front:Vector3 = new Vector3(0,0,1);
    updateMesh()
    {
        
        if( this.particles.length < 2 )
            return;

        if( !this.useColliders)
        {
            this.wrapRBs();
        }
        const config:RibbonConfig = this.module.config as RibbonConfig;
        const positions:BufferAttribute = this.geometry.getAttribute("position") as BufferAttribute;
        const alphas:BufferAttribute = this.geometry.getAttribute("alpha") as BufferAttribute;
        const colors:BufferAttribute = this.geometry.getAttribute("color") as BufferAttribute;
        const bwidths:BufferAttribute = this.geometry.getAttribute("width") as BufferAttribute;

        const curPos:Vector3 = this.v0;
        const prevPos:Vector3 = this.v1;
        const nextPos:Vector3 = this.v2;
        const lines:Vector3[][] = this.lines;
        const widths:number[][] = this.widths;
        const onOffs:boolean[][] = this.onOffs;
        lines.length = 0;
        widths.length = 0;
        onOffs.length = 0;
        let lIndex:number = 0 ;
        lines[0] = [];
        lines[0].push( new Vector3(this.particles[0].rb.translation().x, this.particles[0].rb.translation().y, 0) );
        widths[0] = [];
        widths[0].push( this.particles[0].width );
        onOffs[0] = [];
        onOffs[0].push( this.particles[0].isOn );

        let allDead:boolean = true;
        const minDim:number = Math.min( Execute.worldSize.x, Execute.worldSize.y) * .5;
        
        for( let i:number = 1 ;i< this.particles.length-1; i++)
        {
            const part:RibbonPart = this.particles[i];
            const ppart:RibbonPart = this.particles[i-1];
            const npart:RibbonPart = this.particles[i+1];

            const current:RigidBody = part.rb;
            const previous:RigidBody = ppart.rb;
            const next:RigidBody = npart.rb;

            if( part.rb != null )
                curPos.set(current.translation().x, current.translation().y, -part.depth);
            else 
                curPos.set(part.deathPosition.x, part.deathPosition.y, -part.depth);
            
            if( ppart.rb != null)
                prevPos.set(previous.translation().x, previous.translation().y, -ppart.depth);
            else
                prevPos.set(ppart.deathPosition.x, ppart.deathPosition.y, -ppart.depth);

            if( npart.rb != null)
                nextPos.set(next.translation().x, next.translation().y, -npart.depth);
            else
                nextPos.set(npart.deathPosition.x, npart.deathPosition.y, -npart.depth);
            
                
            const dist:number = curPos.distanceTo(prevPos);
            //this.v3.copy(curPos).sub(prevPos).normalize();
            //this.v4.copy(nextPos).sub(curPos).normalize();
            //const angle:number = Math.abs( this.v3.angleTo(this.v4) );
            

            if( current != null && current.isSleeping())
            {
                
                part.deathPosition.set( curPos.x, curPos.y, curPos.z);
                this.world.removeRigidBody(part.rb);
                part.rb = null;
                part.collider = null;
            }

            if( part.rb != null)
                allDead = false;
            //if( dist > Execute.hWorldSize.x)
            //if( dist > Execute.hWorldSize.x * .5)
            //if( dist > minDim  || angle > Math.PI )
            if( dist > minDim )
            {
                
                lines.push([]);                
                widths.push([]);
                onOffs.push([]);

                lIndex++;

                lines[lIndex].push( curPos.clone() );
                widths[lIndex].push( part.width );
                onOffs[lIndex].push( part.isOn );
            }
            else 
            {
                lines[lIndex].push( curPos.clone() );
                widths[lIndex].push( part.width );
                onOffs[lIndex].push( part.isOn );
            }
            
        }

        if( allDead && this.particles.length > 0)
            return;

        const rc:RibbonConfig = this.module.config as RibbonConfig;
        const baseWidth:number = rc.width.options.min + rc.width.value * 1/9 * (rc.width.options.max - rc.width.options.min);
        
        let vindex:number = 0 ;
        for( let i:number = 0 ;i< lines.length; i++)
        {
            const pts:Vector3[] = lines[i];
            const wds:number[] = widths[i];
            if( pts.length < 2 )
            {
                vindex+=2;
                continue;
            }
            
            for( let j:number = 0 ;j< pts.length; j++)
            {
                const idx:number = vindex;
                const dj:number = j/(pts.length-1);
                const n:Vector3 = new Vector3(0,0,1);
                const tan:Vector3 = new Vector3(0,0,1);
                const currentPos = pts[j];
                const w:number = wds[j];
                const state:boolean = onOffs[i][j];
                if( j == 0 )
                {
                    
                    const nextPos = pts[j+1];
                    tan.copy(nextPos).sub(currentPos).normalize();

                    alphas.setX(idx, 0);
                    alphas.setX(idx+1, 0);
                }
                else if( j == pts.length-1)
                {
                    const prevPos = pts[j-1];
                    tan.copy(currentPos).sub(prevPos).normalize();

                    alphas.setX(idx, 0);
                    alphas.setX(idx+1, 0);
                }
                else 
                {
                    const prevPos = pts[j-1];
                    const nextPos = pts[j+1];
                    currentPos.lerpVectors(prevPos, nextPos, .5); // smooth 
                    tan.copy(nextPos).sub(prevPos).normalize();

                    if( state)
                    {
                        alphas.setX(idx, 1);
                        alphas.setX(idx+1, 1);
                    }
                    else 
                    {
                        alphas.setX(idx, 0);
                        alphas.setX(idx+1, 0);
                    }
                }
                n.copy(tan).cross(this.front).normalize();


                //let totalHW:number = Math.max( 0, w );
                let totalHW:number = Math.max( 0,baseWidth );
                
                bwidths.setX(idx, w);
                bwidths.setX(idx+1, w);

                totalHW = (1.0 - Math.pow( (Math.abs( dj - .5 ) * 2), 4)) * totalHW;
                const pleft:Vector3 = currentPos.clone().add(n.clone().multiplyScalar(totalHW));
                const pright:Vector3 = currentPos.clone().add(n.clone().multiplyScalar(-totalHW));
                
                positions.setXYZ(idx, pright.x, pright.y, pleft.z);
                positions.setXYZ(idx+1, pleft.x, pleft.y, pleft.z);


                if( config.color.value == ColorMode.Rotating)
                {
                    const cval:number = (vindex%500)/500;
                    const c0:Color = new Color();
                    const c1:Color = new Color();
                    let d:number = 0;
                    if( cval < .25)
                    {
                        c0.copy(Palette.colors[0]);
                        c1.copy(Palette.colors[1]);
                        d = cval/.25;
                    }
                    else if( cval < .5)
                    {
                        c0.copy(Palette.colors[1]);
                        c1.copy(Palette.colors[2]);
                        d = (cval-.25)/.25;
                    }
                    else if( cval < .75)
                    {
                        c0.copy(Palette.colors[2]);
                        c1.copy(Palette.colors[3]);
                        d = (cval-.5)/.25;
                    }
                    else 
                    {
                        c0.copy(Palette.colors[3]);
                        c1.copy(Palette.colors[0]);
                        d = (cval-.75)/.25;
                    }
                    
                    c0.lerp(c1, d);
                    colors.setXYZ(idx, c0.r, c0.g, c0.b);
                    colors.setXYZ(idx+1, c0.r, c0.g, c0.b);
                }

                

                

                vindex+=2;
            }
        }

        positions.needsUpdate = true;
        alphas.needsUpdate = true;
        bwidths.needsUpdate = true;

        if( config.color.value == ColorMode.Rotating)
        {
            colors.needsUpdate = true;
        }
        
    }
    
    wrapRBs()
    {
        
        for( let i:number = 0;i<this.particles.length;i++)
        {
            const rb:RigidBody = this.particles[i].rb;
            if( rb == null )
                continue;
            
            const v:Vector2 = new Vector2(rb.translation().x, rb.translation().y);
            const sx:number = Execute.hWorldSize.x;
            const sy:number = Execute.hWorldSize.y;
            if( v.x > sx)
            {
                v.x -= Execute.worldSize.x;
            }
            else if( v.x < -sx)
            {
                v.x += Execute.worldSize.x;
            }
            if( v.y > sy)
            {
                v.y -= Execute.worldSize.y;
            }
            else if( v.y < -sy)
            {
                v.y += Execute.worldSize.y;
            }
            rb.setTranslation({x:v.x,y:v.y}, true);
        }
        
    }

    isOOBV():boolean
    {
        if( this.module.vis == null)
        {
            console.log("Warning : isOOBV: no vis");
            return false;
        }
        const v:Vector3 = this.module.vis.position;
        // return true if the rigid body is outside the world
        const sx:number = Execute.hWorldSize.x;
        const sy:number = Execute.hWorldSize.y;        
        return ( v.x > sx || v.x < -sx || v.y > sy || v.y < -sy);
    }

    
    launchParticle()
    {
        
        const RAPIER = Project.instance.RAPIER;
        const rb:RigidBody = this.module.rb;
        if( rb == null)
            return;
        const config:RibbonConfig = this.module.config as RibbonConfig;
        
        //let forceStrength:number = config.power.value*.1;
        let forceStrength:number = config.power.options.min +  config.power.value*1/9 * (config.power.options.max - config.power.options.min);
        let modAngle:number = 0;
        let modForce:number = 0 ;
        let modHW:number = 0 ;
        let numWave:number = 0 ;
        let isOn:boolean = true;
        for( let i:number = 0;i< this.module.mods.length;i++)
        {
            const mod:Module = this.module.mods[i];
            
            if( mod.type == ModuleType.Rotator)
            {
                modAngle += Rotator.geModuleRotation(this.module, mod.config as RotatorConfig, this.stepCounter);
            }

            else if( mod.type == ModuleType.WaveMod)
            {
                const mc:WaveConfig = mod.config as WaveConfig;
                modHW += WaveMod.getWave(mod.config as WaveConfig, this.stepCounter); 
                numWave++;
            }
            else if( mod.type == ModuleType.Switch)
            {
                const config:SwitchConfig = mod.config as SwitchConfig;
                if( !config.combineRule.value ) 
                    isOn = (isOn && SwitchElem.getValue( config, this.stepCounter));
                else 
                    isOn = (isOn || SwitchElem.getValue( config, this.stepCounter));
            }
        }

        if( numWave > 0)
            modHW /= numWave;
        
        this.module.vis.additionalRotation = modAngle;
        forceStrength += modForce;

        const pNoise:number = config.powerNoise.options.min + config.powerNoise.value*1/9 * (config.powerNoise.options.max - config.powerNoise.options.min);
        const dirNoise:number = config.directionNoise.options.min + config.directionNoise.value*1/9 * (config.directionNoise.options.max - config.directionNoise.options.min);
        forceStrength += Rand.fBetween(- pNoise, pNoise);
        const noiseAngleMax:number = dirNoise * Math.PI /2;
        const directionNoise:number = Rand.fBetween(-noiseAngleMax, noiseAngleMax);
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation() + directionNoise + modAngle;

        const normforce:Vector2 = new Vector2( Math.sin(angle), Math.cos(angle));
        normforce.x *= -1;
        const force:Vector2 = normforce.clone().multiplyScalar(forceStrength);
        const dir:Vector2 = force.clone().normalize();

        const px:number = this.module.vis.position.x - dir.x * 0.5;
        const py:number = this.module.vis.position.y + dir.y * 0.5;

        //const widthVal:number = config.width.options.min + config.width.value*.1 * (config.width.options.max - config.width.options.min);
        const widthNoiseVal:number = config.widthNoise.options.min + config.widthNoise.value*1/9 * (config.widthNoise.options.max - config.widthNoise.options.min);
        //const widthNoise:number = Rand.fBetween(-widthNoiseVal, widthNoiseVal)*.2;
        const widthNoise:number = Rand.fBetween(0, widthNoiseVal)*.25;
        //const totalWidth:number = Math.max( 0,  widthVal - widthNoise - modHW );
        const totalWidth:number = Math.max( 0,  1 - modHW  - widthNoise);
        
        const rbdesc:RigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(px, py)
            .setAngularDamping(0.5)
            .setLinearDamping(1)
            .setAdditionalMassProperties(
                0.1,                // Mass.
                { x: 0.0, y: 0.0 }, // Center of mass.
                0.3                 // Principal angular inertia.
            );
        
        const rbp:RigidBody = this.world.createRigidBody(rbdesc);
        const part:RibbonPart = new RibbonPart();
        part.collider = null;
        if( this.useColliders)
        {
            const colliderDesc:ColliderDesc = RAPIER.ColliderDesc.ball(totalWidth * .25)
                .setRestitution(0.5)
                .setCollisionGroups(this.collisionWalls);
                //.setCollisionGroups(this.collisionSelfAndWalls);
                
            const collider:Collider = this.world.createCollider(colliderDesc, rbp);
            part.collider = collider;
            colliderDesc.setRestitutionCombineRule(CoefficientCombineRule.Min);
        }
        

        rbp.setLinvel({x:force.x, y:force.y }, true);
        part.isOn = isOn;
        part.rb = rbp;
        part.width = totalWidth;  
        //part.collider = null;
        part.depth = 1 + Math.sin( this.stepCounter / 100 );
        this.particles.push(part);
        
        this.stepCounter++;
        
    }

    dispose()
    {
        this.geometry.dispose();
        this.material.dispose();
        this.module = null;
    }
}

export { PRibbon };