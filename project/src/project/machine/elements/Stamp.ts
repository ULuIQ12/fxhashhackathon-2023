import { Group, InstancedMesh, Vector3, Mesh, Float32BufferAttribute, BufferAttribute, Vector2, Material, MeshBasicMaterial, BufferGeometry, PlaneGeometry, Object3D, Color, DynamicDrawUsage, MathUtils } from "three";
import { IElement } from "./IElement";
import { ColorMode, Module, ModuleType, ParticleShape, RotatorConfig, StampConfig, SwitchConfig, WaveConfig } from "../structs/Module";
import { Execute } from "../Execute";
import { Rand } from "../../../helpers/Rand";
import { RigidBody } from "@dimforge/rapier2d";
import { Palette } from "../Palette";
import { StampMaterial } from "../materials/StampMaterial";
import { Rotator } from "./Rotator";
import { SwitchElem } from "./SwitchElem";
import { WaveMod } from "./WaveMod";
import { PerlinMod } from "./PerlinMod";

class Stamp extends Group implements IElement
{
    module: Module;
    isDrawingElement: boolean = true;
    
    material:MeshBasicMaterial;
    stepCounter:number = 0;
    spawnCounter:number = 0;
    spawnTiming:number = 30;
    quadSize:number = 1;
    maxSteps:number = 50;
    mesh:Mesh;
    geometry:BufferGeometry;
    dummy:Object3D = new Object3D();

    constructor(module:Module)
    {
        super();
        this.module = module;

        this.initMesh();
        
    }

    tl:Vector3 = new Vector3(-1,1,0);
    tr:Vector3 = new Vector3(1,1,0);
    bl:Vector3 = new Vector3(-1,-1,0);
    br:Vector3 = new Vector3(1,-1,0);

    initMesh():void
    {
        this.geometry = new BufferGeometry();
        const verts:number[] = [];
        const uvs:number[] = [];
        const indices:number[] = [];
        const normals:number[] = [];
        const colors:number[] = [];
        const alphas:number[] = [];
        const offsets:number[] = [];

        let matVariant:number;
        const config:StampConfig = this.module.config as StampConfig;
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

        const initPos:Vector3 = new Vector3(1000,1000,1000);

        const colorVal:ColorMode = (this.module.config as StampConfig).color.value as ColorMode;
        const initCol:Color = new Color();
        const off:Vector2 = new Vector2();

        if( colorVal == ColorMode.Random || colorVal == ColorMode.Rotating)
            initCol.setHSL(0,0,1);
        else
        {
            const c:number = Object.values(ColorMode).indexOf( colorVal) - 2;
            initCol.copy( Palette.colors[c] );
        }

        for( let i:number = 0 ;i< this.maxSteps ;i ++)
        {
            //initPos.set( Rand.fBetween(-100,100),Rand.fBetween(-100,100), 2  ) ;
            const p0:Vector3 = this.tl.clone().multiplyScalar(this.quadSize).add(initPos);
            const p1:Vector3 = this.tr.clone().multiplyScalar(this.quadSize).add(initPos);
            const p2:Vector3 = this.br.clone().multiplyScalar(this.quadSize).add(initPos);
            const p3:Vector3 = this.bl.clone().multiplyScalar(this.quadSize).add(initPos);

            verts.push(p0.x,p0.y,p0.z);
            verts.push(p1.x,p1.y,p1.z);
            verts.push(p2.x,p2.y,p2.z);
            verts.push(p3.x,p3.y,p3.z);

            uvs.push(0,0);
            uvs.push(1,0);
            uvs.push(1,1);
            uvs.push(0,1);

            const i0:number = i*4;
            indices.push(i0,i0+2,i0+1);
            indices.push(i0,i0+3,i0+2);          
            
            //off.set( Rand.rand(), Rand.rand() );
            off.set( Rand.fBetween(-.1,.1), Rand.fBetween(-.1,.1) );
            for( let j:number = 0 ;j<4;j++)
            {
                normals.push(0,0,1);
                colors.push(initCol.r,initCol.g,initCol.b);
                alphas.push(1);
                offsets.push(off.x,off.y);

            }

        }

        this.geometry.setAttribute( 'position', new Float32BufferAttribute( verts, 3 ) );
        this.geometry.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );
        this.geometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
        this.geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );
        this.geometry.setAttribute( 'alpha', new Float32BufferAttribute( alphas, 1 ) );
        this.geometry.setAttribute( 'offset', new Float32BufferAttribute( offsets, 2 ) );
        this.geometry.setIndex(indices);

        this.geometry.needsUpdate = true;

        this.material = new StampMaterial( {color:0xffffff,vertexColors:true,transparent:true,opacity:1} , matVariant);
        this.mesh = new Mesh( this.geometry, this.material );
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = -1000;
        super.add(this.mesh);
    }


    firstskipped:boolean = false;
    update(dt: number, elapsed: number): void 
    {
        if( this.stepCounter < this.maxSteps && !this.isOOBV() )
        {
            if(this.spawnTiming != -1)
            {
                if( this.spawnCounter%this.spawnTiming==0)
                {
                    if( !this.firstskipped) // skip the first, due to how the physics engine is initialized, and the start offset
                        this.firstskipped = true;
                    else 
                        this.Stamp();
                }
                this.spawnCounter++;
            }
            else 
                this.Stamp();            
        }
    }

    zAxis:Vector3 = new Vector3(0,0,1);
    tempCol:Color = new Color();
    Stamp():void
    {
        const config:StampConfig = this.module.config as StampConfig;
        const rb:RigidBody = this.module.rb;
        let modscale:number = 0;
        let modAngle:number = 0 ;
        let numWaves:number = 0;
        let numPerlin:number = 0 ;
        let pressureMod:number = 0;
        let isOn:boolean = true;
        for( let i:number = 0; i < this.module.mods.length ; i++)
        {
            const mod:Module = this.module.mods[i];
            if( mod.type == ModuleType.WaveMod)
            {
                modscale += WaveMod.getWave(mod.config as WaveConfig, this.stepCounter*20);
                numWaves++;
                
            }
            else if( mod.type == ModuleType.Rotator)
            {
                modAngle += Rotator.geModuleRotation(this.module, mod.config as RotatorConfig, this.stepCounter*20);
            }
            else if( mod.type == ModuleType.Perlin)
            {
                const el:PerlinMod = mod.element as PerlinMod;
                pressureMod += (el.samplePositionNorm(rb.translation().x, rb.translation().y) + 1) / 2;
                
                numPerlin++;
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

        this.module.vis.additionalRotation = modAngle;

        if( !isOn)
        {
            this.stepCounter++;
            return;
        }

        if( numWaves > 1)
            modscale /= numWaves;
        if( numPerlin > 1)
            pressureMod /= numPerlin;
        
        const cScale:number =config.size.options.min + (config.size.options.max-config.size.options.min) * config.size.value * 1/9 
        const scale:number = cScale * (1-modscale);
        const col:Color =this.tempCol;
        
        if( config.color.value == ColorMode.Random)
            col.copy( Rand.option(Palette.colors));
        else if( config.color.value == ColorMode.Rotating)
        {
            const cval:number = (this.stepCounter%5)/5;
            Palette.GetInterpolatedColor(cval, col);
        }
        else
        {
            const c:number = Object.values(ColorMode).indexOf( config.color.value as ColorMode) - 2;
            col.copy( Palette.colors[c] );
        }
        const calpha:number = config.pressure.options.min + (config.pressure.options.max-config.pressure.options.min) * config.pressure.value * 1/9 ;
        const alpha:number = calpha - pressureMod * calpha;

        const depth:number = -10 -( 1- this.stepCounter / this.maxSteps) * 1;
        const positions:BufferAttribute = this.geometry.getAttribute("position") as BufferAttribute;
        const colors:BufferAttribute = this.geometry.getAttribute("color") as BufferAttribute;
        const alphas:BufferAttribute = this.geometry.getAttribute("alpha") as BufferAttribute;
        
        const index:number = this.stepCounter * 4;

        const px:number = this.module.vis.position.x;
        const py:number = this.module.vis.position.y;
        
        const pos:Vector3 = new Vector3(px,py,depth);
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation() + modAngle;
        const axis:Vector3 = this.zAxis;
        
        const p0:Vector3 = this.tl.clone().applyAxisAngle(axis,angle).multiplyScalar(this.quadSize * scale).add(pos);
        const p1:Vector3 = this.tr.clone().applyAxisAngle(axis,angle).multiplyScalar(this.quadSize * scale).add(pos);
        const p2:Vector3 = this.br.clone().applyAxisAngle(axis,angle).multiplyScalar(this.quadSize * scale).add(pos);
        const p3:Vector3 = this.bl.clone().applyAxisAngle(axis,angle).multiplyScalar(this.quadSize * scale).add(pos);
        
        positions.setXYZ(index+0,p0.x,p0.y,p0.z);
        positions.setXYZ(index+1,p1.x,p1.y,p1.z);
        positions.setXYZ(index+2,p2.x,p2.y,p2.z);
        positions.setXYZ(index+3,p3.x,p3.y,p3.z);

        colors.setXYZ(index+0,col.r,col.g,col.b);
        colors.setXYZ(index+1,col.r,col.g,col.b);
        colors.setXYZ(index+2,col.r,col.g,col.b);
        colors.setXYZ(index+3,col.r,col.g,col.b);

        alphas.setX(index+0,alpha);
        alphas.setX(index+1,alpha);
        alphas.setX(index+2,alpha);
        alphas.setX(index+3,alpha);

        positions.needsUpdate = true;
        colors.needsUpdate = true;
        alphas.needsUpdate = true;
        

        this.stepCounter ++ ;
    }

    isOOBV():boolean
    {
        const v:Vector3 = this.module.vis.position;
        // return true if the rigid body is outside the world
        const sx:number = Execute.hWorldSize.x;
        const sy:number = Execute.hWorldSize.y;        
        return ( v.x > sx || v.x < -sx || v.y > sy || v.y < -sy);
    }
    
    dispose():void 
    {
        this.material.dispose();
        this.geometry.dispose();
        this.mesh = null;
    }
    
    getProgress(): number 
    {
        return this.stepCounter / this.maxSteps;
    }
    
    
}

export {Stamp};