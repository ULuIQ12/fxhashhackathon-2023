import { Group, BufferGeometry, BufferAttribute, Vector3, Vector2, Mesh, Float32BufferAttribute, DynamicDrawUsage, LineBasicMaterial, Line, CatmullRomCurve3, AdditiveBlending, Color } from "three";
import { Module, ModuleType } from "../structs/Module";
import { Collider, ColliderDesc, RigidBody, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Execute } from "../Execute";
import { PStreamMaterial } from "../materials/PStreamMaterial";
import { IElement } from "./IElement";
import { Rand } from "../../../helpers/Rand";
import { Palette } from "../Palette";

class PartyStream extends Group implements IElement
{
    vBudget:number = 2000;
    insertDelay:number = 0.025;
    lastInsert:number = 0;
    insertCounter:number = 0;
    geom:BufferGeometry;
    module:Module;
    world:World;
    pointsRBs:RigidBody[] = [];
    mesh:Line;

    useCurve:boolean = false;
    curve:CatmullRomCurve3;

    v0:Vector2 = new Vector2();
    v1:Vector2 = new Vector2();

    spawnTiming:number = -1;
    spawnCounter:number = 0;

    stepCount:number = 0;
    period:number = 20;

    color:Color;// = Rand.option( Palette.colors );

    constructor(m:Module, w:World)
    {
        super();
        this.module = m;
        this.world = w;
        this.geom = new BufferGeometry();
        const verts:number[] = [];
        const colors:number[] = [];
        const alphas:number[] = [];
        this.v0.set(this.module.rb.translation().x, this.module.rb.translation().y);
        for( let i:number = 0;i<this.vBudget;i++)
        {
            verts.push(this.v0.x, this.v0.y, 0);
            colors.push(0,0,0);
            alphas.push(0);
        }
        this.geom.setAttribute("position", new Float32BufferAttribute(verts, 3).setUsage(DynamicDrawUsage))
        this.geom.setAttribute("color", new Float32BufferAttribute(colors, 3).setUsage(DynamicDrawUsage));
        this.geom.setAttribute("alpha", new Float32BufferAttribute(alphas, 1).setUsage(DynamicDrawUsage));

        //const mat:PStreamMaterial = new PStreamMaterial({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:true, blending:AdditiveBlending});
        const mat:PStreamMaterial = new PStreamMaterial({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:true});
        const mesh:Line = new Line(this.geom, mat);
        mesh.position.z = -1;
        super.add(mesh);
        this.mesh = mesh;
    }
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean = true;

    

    isFull():boolean
    {
        return (this.pointsRBs.length >= this.vBudget);
    }

    reset()
    {
        this.pointsRBs = [];
    }

    dispose()
    {
        this.module = null;
        this.mesh.geometry.dispose();
        this.mesh = null;
        this.pointsRBs = null;
    }

    
    update( dt:number, elapsed:number)
    {
        if( !this.isFull() )
        {
            if(this.spawnTiming != -1)
            {
                if( this.spawnCounter%this.spawnTiming==0)
                {
                    this.AddPart();
                }

                this.spawnCounter++;
            }
            else 
            {
                this.AddPart();
            }
        }

        this.updateMesh(dt, elapsed)
        
        this.stepCount++;
    }

    updateMesh(dt:number, elapsed:number)
    {
        const positions:BufferAttribute = this.geom.getAttribute("position") as BufferAttribute;
        const colors:BufferAttribute = this.geom.getAttribute("color") as BufferAttribute;
        const alphas:BufferAttribute = this.geom.getAttribute("alpha") as BufferAttribute;
        let i:number = 0;
        
        
        
        const far:number = 100000;
        if( !this.useCurve)
        {
            for( i=0;i<this.pointsRBs.length;i++)
            {
                const rb:RigidBody = this.pointsRBs[i];
                //Execute.wrapRb(rb);
                this.v0.set(rb.translation().x, rb.translation().y);            
                positions.setXYZ(i, this.v0.x, this.v0.y, 0);
                colors.setXYZ(i, this.color.r, this.color.g, this.color.b);

                if( i>0)
                {
                    const prb:RigidBody = this.pointsRBs[i-1];
                    this.v1.set(prb.translation().x, prb.translation().y);
                    const d:number = this.v0.distanceTo(this.v1);
                    
                    if( d > Execute.hWorldSize.x )
                    {
                        alphas.setX(i, 0);
                        alphas.setX(i-1, 0,);
                    }
                    else 
                        alphas.setX(i,1);
                }
                else 
                    alphas.setX(i,1);

                
            }
        }
        else 
        {
            if( this.curve != undefined )
            {
                if( this.curve.points.length > 1)
                {
                    const pts:Vector3[] = this.curve.getSpacedPoints(this.pointsRBs.length);
                    //const pts:Vector3[] = this.curve.getPoints(this.pointsRBs.length);
                    for( i=0;i<pts.length;i++)
                    {
                        const pt:Vector3 = pts[i];
                        this.v0.set(pt.x, pt.y);
                        positions.setXYZ(i, this.v0.x, this.v0.y, 0);
                        colors.setXYZ(i, 1, 1, 1);
                        alphas.setX(i, 1);
                    }
                }
            }
        }
        
        this.v0.set(this.module.rb.translation().x, this.module.rb.translation().y);

        for( ;i<this.vBudget;i++)
        {
            positions.setXYZ(i, this.v0.x, this.v0.y, 0);
            colors.setXYZ(i, 0, 0, 0);
            alphas.setX(i, 0);
        }

        positions.needsUpdate = true;
        colors.needsUpdate = true;
        alphas.needsUpdate = true;
    }

    AddPart()
    {
        const rb:RigidBody = this.module.rb;
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation();
        const normforce:Vector2 = new Vector2( Math.sin(angle), Math.cos(angle));
        normforce.x *= -1;
        let forceStrength:number = 25;

        let modForce:number = 0 ;
        for( let i:number = 0;i< this.module.mods.length;i++)
        {
            const mod:Module = this.module.mods[i];
            if( mod.type == ModuleType.WaveMod)
            {
                modForce += -25 + Math.sin(this.stepCount * 1/this.period) * 25;
             
            }
        }
        forceStrength += modForce;

        const force:Vector2 = normforce.clone().multiplyScalar(forceStrength);
        const dir:Vector2 = force.clone().normalize();
        //const px:number = rb.translation().x - dir.x * 0.5;
        //const py:number = rb.translation().y + dir.y * 0.5;

        const px:number = this.module.vis.position.x - dir.x * 0.5;
        const py:number = this.module.vis.position.y + dir.y * 0.5;

        const rbdesc:RigidBodyDesc = RigidBodyDesc.dynamic()
            .setTranslation(px, py)
            .setAngularDamping(0.5)
            .setLinearDamping(1)
            .setAdditionalMassProperties(
                0.1,                // Mass.
                { x: 0.0, y: 0.0 }, // Center of mass.
                0.3                 // Principal angular inertia.
            );
        
        const rbp:RigidBody = this.world.createRigidBody(rbdesc);
        const colliderDesc:ColliderDesc = ColliderDesc.ball(0.1)
            .setRestitution(1.1)
            .setCollisionGroups(0x00080001);
        const collider:Collider = this.world.createCollider(colliderDesc, rbp);
        rbp.setLinvel({x:force.x, y:force.y }, true);

        this.addPointRB(rbp);
    }

    addPointRB(rb:RigidBody)
    {
        this.pointsRBs.push(rb);

        if( this.useCurve)
        {
            this.curve = new CatmullRomCurve3();
            this.curve.points = this.pointsRBs.map( (rb:RigidBody) => { return new Vector3(rb.translation().x, rb.translation().y, 0); });
            this.curve.curveType = "catmullrom";
            this.curve.closed = false;
            this.curve.tension = .2;
        }

    }
}

export { PartyStream };