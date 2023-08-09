import { Group, InstancedMesh, Vector3, Vector2, Material, MeshBasicMaterial, BufferGeometry, PlaneGeometry, Object3D, Color, DynamicDrawUsage, MathUtils } from "three";
import { IElement } from "./IElement";
import { ColorMode, Module, ModuleType, ParticleShape, ParticlesConfig, RotatorConfig, SwitchConfig, WaveConfig, WaveShape } from "../structs/Module";
import { CoefficientCombineRule, Collider, ColliderDesc, RigidBody, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Execute } from "../Execute";
import { Rotator } from "./Rotator";
import { Rand } from "../../../helpers/Rand";
import { OutlinePartTop } from "../materials/OutlinePartTop";
import { Palette } from "../Palette";
import { Project } from "../../Project";
import { PerlinMod } from "./PerlinMod";
import { WaveMod } from "./WaveMod";
import { SwitchElem } from "./SwitchElem";

class PartInfos
{
    rb:RigidBody;
    collider:Collider;
    scale:number=1;
    depth:number=0;
    color:Color = new Color();
    index:number = 0 ;
    life:number = 0 ;
    isOn:boolean = true;
}

class ParticleSpray extends Group implements IElement
{
    module: Module;
    world:World;
    particles:PartInfos[] = [];
    imesh:InstancedMesh;
    material:Material;
    maxSteps:number = 1000;
    stepCounter:number = 0;
    spawnCounter:number = 0;
    spawnTiming:number = 3;
    useColliders:boolean = false;
    collideSelf:boolean = true;
    collisionGroupWalls:number = 0x00040001; // just  walls  0100
    collisionGroupSelf:number = 0x00040004; // walls and itself 0101
    collisionGroupSelfAndWalls:number = 0x00040005; // walls and itself 0101
    TAU:number = Math.PI*2;
    quadSize:number = 1;

    dummy:Object3D = new Object3D();

    constructor(m:Module, w:World)
    {
        super();
        this.module = m;
        this.world = w;

        this.init()
        
    }
    

    init()
    {
        const config:ParticlesConfig = this.module.config as ParticlesConfig;
        let matVariant:number;
        switch(config.shape.value)
        {
            case ParticleShape.Circle:
                matVariant = 0;
                break;
            case ParticleShape.Square:
                matVariant = 1;
                break;
            case ParticleShape.Triangle:
                matVariant = 2;
                break;
            case ParticleShape.Hexagon:
                matVariant = 3;
                break;
            case ParticleShape.Rectangle:
                matVariant = 4;
                break;
            case ParticleShape.Line:
                matVariant = 5;
                break;
        } 
        if( config.selfCollide.value )
        {
            this.maxSteps = 500;
            this.spawnTiming = 3;
        }
        else 
        {
            this.maxSteps = 750;
            this.spawnTiming = 2;
        }
        const mat:Material = new OutlinePartTop({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:false}, matVariant);
        this.material = mat;
        let geom:BufferGeometry;

        if( config.shape.value == ParticleShape.Line)
            geom = new PlaneGeometry(this.quadSize * 5 ,this.quadSize * .025,1,1);
        else
            geom = new PlaneGeometry(this.quadSize,this.quadSize,1,1);

        const m:InstancedMesh = new InstancedMesh(geom, mat, this.maxSteps);
        this.dummy.position.set(Number.MAX_VALUE,Number.MAX_VALUE,0);
        this.dummy.updateMatrix();
        const initColor:Color = new Color();
        if( config.color.value != ColorMode.Random && config.color.value != ColorMode.Rotating)
        {
            const c:number = Object.values(ColorMode).indexOf( config.color.value as ColorMode) - 2;
            initColor.copy(Palette.colors[c]);
        }

        for( let i:number = 0;i<this.maxSteps;i++)
        {
            m.setMatrixAt(i, this.dummy.matrix);
            m.setColorAt(i, initColor);
        }

        m.instanceMatrix.setUsage(DynamicDrawUsage);
        m.instanceColor.setUsage(DynamicDrawUsage);
        m.instanceColor.needsUpdate = true;
        m.instanceMatrix.needsUpdate = true;
        this.useColliders = config.enableCollision.value;
        this.collideSelf = config.selfCollide.value;
        this.imesh = m;
        this.imesh.frustumCulled = false;
        super.add(m);
    }

    isDrawingElement: boolean = true;
    getProgress(): number {
        return this.stepCounter/this.maxSteps;
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

        if( !this.useColliders)
        {
            this.wrapRBs();
        }

        this.updateMesh();
    }

    launchParticle()
    {   
        const rb:RigidBody = this.module.rb;
        const config:ParticlesConfig = this.module.config as ParticlesConfig;

        let modscale:number = 0;
        let numWaves:number = 0;
        let isOn:boolean = true;
        for( let i:number = 0;i< this.module.mods.length;i++)
        {
            const mod:Module = this.module.mods[i];
            if( mod.type == ModuleType.WaveMod)
            {

                modscale += WaveMod.getWave(mod.config as WaveConfig, this.stepCounter);
                numWaves++;
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

        if( numWaves > 0)
            modscale /= numWaves;
        
        let scale:number=1- modscale;
        let forceStrength:number = config.power.options.min +  config.power.value*.1 * (config.power.options.max - config.power.options.min);
        forceStrength = Math.max( 0.2, forceStrength);
        let modAngle:number = 0;
        let modForce:number = 0 ;
        for( let i:number = 0;i< this.module.mods.length;i++)
        {
            const mod:Module = this.module.mods[i];

            if( mod.type == ModuleType.Rotator)
            {
                modAngle += Rotator.geModuleRotation(this.module, mod.config as RotatorConfig, this.stepCounter);
            }
        }
        this.module.vis.additionalRotation = modAngle;
        forceStrength += modForce;

        const pNoise:number = config.powerNoise.options.min +  config.powerNoise.value*.1 * (config.powerNoise.options.max - config.powerNoise.options.min);
        const dirNoise:number = config.directionNoise.options.min +  config.directionNoise.value*.1 * (config.directionNoise.options.max - config.directionNoise.options.min);
        forceStrength += Rand.fBetween(- pNoise, pNoise);
        const noiseAngleMax:number = dirNoise * Math.PI /2;
        const directionNoise:number = Rand.fBetween(-noiseAngleMax, noiseAngleMax);
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation() + directionNoise + modAngle;

        const normforce:Vector2 = new Vector2( Math.sin(angle), Math.cos(angle));
        normforce.x *= -1;
        const force:Vector2 = normforce.clone().multiplyScalar(forceStrength);
        const dir:Vector2 = force.clone().normalize();
        dir.multiplyScalar(scale*.5);

        const px:number = this.module.vis.position.x - dir.x * 0.5;
        const py:number = this.module.vis.position.y + dir.y * 0.5;

        const RAPIER = Project.instance.RAPIER;

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
        
        const sizeVal:number = (isOn)?config.size.options.min +  config.size.value*1/9* (config.size.options.max - config.size.options.min):0;
        let collider:Collider;
        if( this.useColliders || this.collideSelf)
        {
            let colliderDesc:ColliderDesc;
            
            const size:number = Math.max(0.01,sizeVal * scale);
            if( config.shape.value == ParticleShape.Circle)
            {
                colliderDesc = RAPIER.ColliderDesc.ball(size * .5)
            }
            else if( config.shape.value == ParticleShape.Square)
            {
                colliderDesc = RAPIER.ColliderDesc.cuboid(size*.5,size*.5);
            }
            else if(config.shape.value == ParticleShape.Triangle)
            {
                const triHeight:number = size * 0.86602540378;
                colliderDesc = RAPIER.ColliderDesc.convexHull(new Float32Array([-size/2, -triHeight/2, size/2, -triHeight/2, 0, triHeight/2]) );
            }
            else if( config.shape.value == ParticleShape.Hexagon)
            {
                const hexHeight:number = size * 0.86602540378;
                const hexWidth:number = size * 0.5;
                colliderDesc = RAPIER.ColliderDesc.convexHull(new Float32Array([-hexWidth, 0, -hexWidth/2, -hexHeight, hexWidth/2, -hexHeight, hexWidth, 0, hexWidth/2, hexHeight, -hexWidth/2, hexHeight]) );
            }
            else if( config.shape.value == ParticleShape.Rectangle)
            {
                colliderDesc = RAPIER.ColliderDesc.cuboid(size*.5,size * .25);
            }
            else if( config.shape.value == ParticleShape.Line)
            {
                colliderDesc = RAPIER.ColliderDesc.cuboid(size *.5 * 5,size * .5 * 0.025);
            }
            if( this.collideSelf)
            {
                if( this.useColliders)
                    colliderDesc.setCollisionGroups(this.collisionGroupSelfAndWalls);
                else 
                    colliderDesc.setCollisionGroups(this.collisionGroupSelf);
            }
            else if( this.useColliders)
                colliderDesc.setCollisionGroups(this.collisionGroupWalls);
            
            colliderDesc.setRestitution(.5);
            colliderDesc.setRestitutionCombineRule(CoefficientCombineRule.Min);

            collider = this.world.createCollider(colliderDesc, rbp);
            collider.setEnabled(false); // activate collider only after a few frames ? 
            
        }
        rbp.setAngvel(Rand.fBetween(-10,10), true);
        rbp.setLinvel({x:force.x, y:force.y }, true);
        rbp.setRotation(Rand.fBetween(0,Math.PI*2), true);

        const pi:PartInfos = new PartInfos();
        pi.rb = rbp;
        if( this.useColliders || this.collideSelf)
            pi.collider = collider;
        
        pi.life = 0 ;
        pi.scale = sizeVal * scale;
        pi.depth = Rand.rand() * 5;
        pi.index = this.stepCounter;
        if( config.color.value == ColorMode.Random)
            pi.color.copy( Rand.option(Palette.colors));
        else if( config.color.value == ColorMode.Rotating)
        {
            const index:number = Math.floor( (this.stepCounter * .1)%Palette.colors.length );
            const cval:number = (this.stepCounter%100)/100;
            //pi.color.copy( Palette.colors[index]);
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
            pi.color.copy(c0);
        }

        this.particles.push(pi);
        this.stepCounter++;
    }   

    updateMesh()
    {
        const config:ParticlesConfig = this.module.config as ParticlesConfig;
        for( let i:number = 0 ;i< this.particles.length;i++)
        {
            const part:PartInfos = this.particles[i];
            if( part == null)
                continue;
            const rb:RigidBody = this.particles[i].rb;
            if( rb == null )
                continue;

            part.life ++ ;
            
            if( rb.isSleeping() ) // hard culling, destroyed as soon as they're sleeping
            {
                
                if( !this.collideSelf)
                {
                    
                    /*
                    if( config.color.value == ColorMode.Random || config.color.value == ColorMode.Rotating)
                        this.imesh.setColorAt(i, part.color);
                    this.imesh.setMatrixAt(i, this.dummy.matrix);
                    */
                    this.updateDummy(part);
                    if( config.color.value == ColorMode.Random || config.color.value == ColorMode.Rotating)
                        this.imesh.setColorAt(part.index, part.color);
                    this.imesh.setMatrixAt(part.index, this.dummy.matrix);
                    this.world.removeRigidBody(rb);
                    part.rb = null;
                    this.particles[i] = null;
                }
                continue;
            }

            if( part.life == 10 && (this.useColliders || this.collideSelf))
            {
                part.collider.setEnabled(true);
                //part.rb.
            }

            const currentVel:Vector2 = new Vector2(rb.linvel().x, rb.linvel().y);
            const velAmp:number = currentVel.length();

            if( velAmp < 0.01)
            {
                rb.sleep();
                continue;
            }

            let modAngle:number = 0;
            for( let j:number =0 ;j< this.module.mods.length;j++)
            {
                if( this.module.mods[j].type == ModuleType.Perlin)
                {
                    const el:PerlinMod = this.module.mods[j].element as PerlinMod;
                    const pval:number = el.samplePosition(rb.translation().x, rb.translation().y) * Math.PI *.1;
                    modAngle += pval;
                }
            }
            if( modAngle != 0)
            {
                rb.setRotation(modAngle, true);
                const impulse:Vector2 = new Vector2(Math.cos(modAngle), Math.sin(modAngle));
                impulse.multiplyScalar(velAmp * 0.001);
                rb.applyImpulse({x:impulse.x, y:impulse.y}, false);
            }

            this.updateDummy(part);

            //this.imesh.setMatrixAt(i, this.dummy.matrix);
            this.imesh.setMatrixAt(part.index, this.dummy.matrix);

            if( config.color.value == ColorMode.Random || config.color.value == ColorMode.Rotating)
                //this.imesh.setColorAt(i, part.color);
                this.imesh.setColorAt(part.index, part.color);
        }

        if( config.color.value == ColorMode.Rotating || config.color.value == ColorMode.Random)
            this.imesh.instanceColor.needsUpdate = true;
        
        this.imesh.instanceMatrix.needsUpdate = true;
    }

    updateDummy(part:PartInfos)
    {
        this.dummy.scale.set(part.scale, part.scale, 1);
        this.dummy.position.set(part.rb.translation().x, part.rb.translation().y, -part.depth);
        this.dummy.rotation.set(0,0,part.rb.rotation());
        this.dummy.updateMatrix();
    }

    wrapRBs()
    {
        for( let i:number = 0;i<this.particles.length;i++)
        {
            const part:PartInfos = this.particles[i];
            if( part == null || part.rb == null)
                continue;
            const rb:RigidBody = part.rb;
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
        const v:Vector3 = this.module.vis.position;
        // return true if the rigid body is outside the world
        const sx:number = Execute.hWorldSize.x;
        const sy:number = Execute.hWorldSize.y;        
        return ( v.x > sx || v.x < -sx || v.y > sy || v.y < -sy);
    }

    dispose()
    {
        this.imesh.dispose();
        this.material.dispose();
    }
    
    
}

export { ParticleSpray };