import { Group, BufferGeometry, Vector3, Mesh, MeshBasicMaterial, BufferAttribute, Float32BufferAttribute, Vector2, DynamicDrawUsage, Material, Quaternion, MathUtils, Matrix4, CatmullRomCurve3, StaticDrawUsage, Color} from "three";
import { IElement } from "./IElement";
import { Module, ModuleType } from "../structs/Module";
import { RigidBody } from "@dimforge/rapier2d";
import { PStreamMaterial } from "../materials/PStreamMaterial";
import { RibbonMaterial } from "../materials/RibbonMaterial";
import { Rand } from "../../../helpers/Rand";
import { Palette } from "../Palette";
import { Execute } from "../Execute";

class Ribbon extends Group implements IElement
{
    module: any;

    width:number = 0.1 ;
    hWidth:number = this.width/2;
    stepCounter:number = 0;
    maxSteps:number = 1000;
    geometry:BufferGeometry;
    material:Material;

    spawnTiming:number = 2;
    spawnCounter:number = 0;
    posHistory:Vector3[] = [];
    tanHistory:Vector3[] = [];
    color:Color;// = Rand.option( Palette.colors );

    period:number;// = Rand.iBetween(1, 20);

    constructor(m:Module)
    {
        super();
        this.module = m;
        this.init();
    }
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean = true;

    init()
    {
        this.stepCounter = 0;
        this.spawnCounter = 0;

        const g:BufferGeometry = new BufferGeometry();
        this.geometry = g;
        const verts:number[] = [];
        const colors:number[] = [];
        const alphas:number[] = [];
        const indices:number[] = [];
        const uvs:number[] = [];
        for( let i:number = 0;i<this.maxSteps;i++)
        {
            verts.push(0,0,0,0,0,0);
            colors.push(0,0,0,0,0,0);
            alphas.push(0,0);

            const v:number = i/(this.maxSteps-1);
            uvs.push(0,v,1,v);

            if(i>0)
            {         
                const index:number = i*2;       
                indices.push(index-2, index-1, index, index, index-1, index+1);
            }
        }
        g.setIndex(indices);
        g.setAttribute("position", new Float32BufferAttribute(verts, 3).setUsage(DynamicDrawUsage));
        g.setAttribute("color", new Float32BufferAttribute(colors, 3).setUsage(DynamicDrawUsage));
        g.setAttribute("alpha", new Float32BufferAttribute(alphas, 1).setUsage(DynamicDrawUsage));
        g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

        this.material = new RibbonMaterial({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:true, wireframe:false});
        const mesh = new Mesh(g, this.material);
        mesh.position.z = -1;
        mesh.frustumCulled = false;
        super.add(mesh);
    }

    update(dt: number, elapsed: number): void
    {
        
        //this.posHistory.push(new Vector3(this.module.rb.translation().x, this.module.rb.translation().y));
        this.posHistory.push(this.module.vis.position.clone());
        if( this.stepCounter > 0)
            this.tanHistory.push(this.posHistory[this.stepCounter].clone().sub(this.posHistory[this.stepCounter-1]).normalize());
        else 
        {
            const a:number = Module.orientationToAngle(this.module.orientation) + this.module.rb.rotation();
            this.tanHistory.push(new Vector3(Math.cos(a), Math.sin(a)));
        }
        
        if( this.stepCounter < this.maxSteps && !this.isOOBV() )
        {
            if(this.spawnTiming != -1)
            {
                if( this.spawnCounter%this.spawnTiming==0)
                    this.addStep();
                this.spawnCounter++;
            }
            else 
                this.addStep();            
        }

    }

    tempMat:Matrix4 = new Matrix4();
    modForce:number;// = Rand.fBetween(1,10) ;
    addStep()
    {
        
        const rb:RigidBody = this.module.rb;
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation();
        const positions:BufferAttribute = this.geometry.getAttribute("position") as BufferAttribute;
        const colors:BufferAttribute = this.geometry.getAttribute("color") as BufferAttribute;
        const alphas:BufferAttribute = this.geometry.getAttribute("alpha") as BufferAttribute;

        const pt:Vector3 = this.posHistory[this.stepCounter];
        const tan:Vector3 = this.tanHistory[this.stepCounter];
        const norm:Vector3 = new Vector3(Math.cos(angle + Math.PI*.5), Math.sin(angle + Math.PI*.5), 0).normalize();
        if( this.stepCounter > 0)
        {
            const curve:CatmullRomCurve3 = new CatmullRomCurve3(this.posHistory);
            curve.getPointAt(1, pt);
            curve.getTangentAt(1, tan);
            norm.copy(tan).cross(new Vector3(0,0,1)).normalize();
        }

        const baseWidth:number = this.width;
        let modWidth:number = 0;
        for( let i:number = 0 ;i< this.module.mods.length; i++)
        {
            const mod:Module = this.module.mods[i];
            if(mod.type == ModuleType.WaveMod)
            {
                modWidth +=  this.modForce/2 + Math.sin(this.stepCounter * 1/this.period) * this.modForce/2;
            }
        }

        const totalWidth:number = baseWidth + modWidth;
        
        const pleft:Vector3 = pt.clone().add(norm.clone().multiplyScalar(totalWidth*.5));
        const pright:Vector3 = pt.clone().add(norm.clone().multiplyScalar(-totalWidth*.5));

        const dz:number =  0.5 + Math.sin( this.stepCounter/this.maxSteps * 50 ) * .5;
        
        const idx:number = this.stepCounter*2;
        positions.setXYZ(idx+1, pleft.x, pleft.y, -dz);
        positions.setXYZ(idx, pright.x, pright.y, -dz);


        const color:Color = this.color;
        colors.setXYZ(idx, color.r, color.g, color.b);
        colors.setXYZ(idx+1, color.r, color.g, color.b);

        if( this.stepCounter > 1)
        {   
            alphas.setX(idx-1, 1);
            alphas.setX(idx-2, 1);
        }

        if( this.stepCounter > 2)
        {
            const p0i:number = idx-4;
            const p1i:number = idx-2;
            const p0:Vector3 = this.posHistory[this.stepCounter-1];
            const p1:Vector3 = this.posHistory[this.stepCounter-2];
            const dist:number = p0.distanceTo(p1);
            if( dist > 10)
            {
                alphas.setX(p0i, 0);
                alphas.setX(p0i+1, 0);
                alphas.setX(p1i, 0);
                alphas.setX(p1i+1, 0);
            }
        }
        

        positions.needsUpdate = true;
        colors.needsUpdate = true;
        alphas.needsUpdate = true;        

        this.stepCounter++;
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
        this.geometry.dispose();
        this.material.dispose();
        this.posHistory = [];
        this.tanHistory = [];
        this.module = null;
    }


    
}

export { Ribbon };