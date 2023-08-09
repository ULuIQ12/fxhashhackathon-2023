import { AdditiveBlending, BufferGeometry, Color, DynamicDrawUsage, Group, InstancedMesh, MeshBasicMaterial, Object3D, PlaneGeometry, Vector2 } from "three";
import { Module } from "../structs/Module";
import { CoefficientCombineRule, Collider, ColliderDesc, RigidBody, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Rand } from "../../../helpers/Rand";
import { OutlinePartTop } from "../materials/OutlinePartTop";
import { OutlinePartBottom } from "../materials/OutlinePartBottom";
import { IElement } from "./IElement";
import { Palette } from "../Palette";


class OutlineParts extends Group implements IElement
{
    parent:any;
    visible: boolean;
    maxParts:number = 1000;
    psize:number = 1;
    topMaterial:MeshBasicMaterial;
    bottomMaterial:MeshBasicMaterial;
    topIMesh:InstancedMesh;
    bottomIMesh:InstancedMesh;
    dummy:Object3D = new Object3D();
    module:Module;
    world:World;
    particles:RigidBody[] = [];
    scales:number[] = [];
    levels:number[] = [];
    colors:Color[] = [];
    addCollidersToParts:boolean = true;
    spawnTiming:number = 3;
    spawnCounter:number = 0;
    variant:number = 0 ;
    collisionGroup:number = 0x00040001; // just  walls  
    collisionGroupAlt:number = 0x00040005; // walls and itself
    constructor(m:Module, w:World)
    {
        super();
        //this.variant = Rand.iBetween(0,4);
        this.world = w;
        this.module = m;
        this.init();
    }
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean = true;

    colorOptions:Color[] = Palette.colors;
    init()
    {
        //const testCol:Color = new Color().setHSL(Rand.rand(), 1, .5);
        //const testCol:Color = Rand.option(this.colorOptions);
        this.topMaterial = new OutlinePartTop({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:false}, this.variant);
        this.bottomMaterial = new OutlinePartBottom({color:0x1D1D1B, transparent:true, alphaTest:.5, vertexColors:false}, this.variant);
        const geom:BufferGeometry = new PlaneGeometry(this.psize,this.psize);
        this.topIMesh = new InstancedMesh(geom, this.topMaterial, this.maxParts);
        this.bottomIMesh = new InstancedMesh(geom, this.bottomMaterial, this.maxParts);
        const m:number = Number.MAX_VALUE;
        for( let i:number = 0; i<this.maxParts; i++)
        {
            this.dummy.scale.set(0,0,1);
            this.dummy.position.set(m,m,m);
            this.dummy.updateMatrix();
            this.topIMesh.setMatrixAt(i, this.dummy.matrix);
            this.topIMesh.setColorAt(i, this.colorOptions[0]);
            this.bottomIMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.topIMesh.instanceMatrix.setUsage(DynamicDrawUsage);
        this.bottomIMesh.instanceMatrix.setUsage(DynamicDrawUsage);
        this.topIMesh.frustumCulled = false;
        this.bottomIMesh.frustumCulled = false;
        super.add(this.topIMesh);
        super.add(this.bottomIMesh);
    }

    update( dt:number, elapsed:number)
    {
        
        if( this.particles.length < this.maxParts)
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
            
        
        let i:number = 0;
        for( i=0; i<this.particles.length; i++)
        {
            const rb:RigidBody = this.particles[i];
            if( rb == null)
                continue;
            
            if( rb.isSleeping() ) // hard culling, destroyed as soon as they're sleeping
            {
                this.world.removeRigidBody(rb);
                this.particles[i] = null;
                this.scales[i] = 0;
                this.levels[i] = 0;
                continue;
            }
            this.dummy.scale.set(this.scales[i], this.scales[i], 1);
            this.dummy.position.set(rb.translation().x, rb.translation().y, -this.levels[i]);
            this.dummy.rotation.set(0,0,rb.rotation());
            this.dummy.updateMatrix();
            this.topIMesh.setMatrixAt(i, this.dummy.matrix);
            this.topIMesh.setColorAt(i, this.colors[i]);
            this.dummy.position.z = -1.0;
            this.dummy.updateMatrix();
            this.bottomIMesh.setMatrixAt(i, this.dummy.matrix);
        }


        this.topIMesh.instanceMatrix.needsUpdate = true;
        this.topIMesh.instanceColor.needsUpdate = true;
        this.bottomIMesh.instanceMatrix.needsUpdate = true;
    }

    AddPart()
    {
        const pscale:number = 0.5 + Math.pow( Rand.rand(), 4) * 6;
        const rb:RigidBody = this.module.rb;
        const jitRange:number = Math.PI / 32;
        const dirJit:number = Rand.fBetween(-jitRange, jitRange);
        const angle:number = Module.orientationToAngle(this.module.orientation) + rb.rotation() + dirJit;
        const minForce:number = 0.5;
        const maxForce:number = 0.6;
        const forceStrength:number = Rand.fBetween(minForce, maxForce);
        const normforce:Vector2 = new Vector2( Math.sin(angle), Math.cos(angle));
        normforce.x *= -1;
        const force:Vector2 = normforce.clone().multiplyScalar(forceStrength);


        const dir:Vector2 = force.clone().normalize();
        //const px:number = rb.translation().x - dir.x * 0.5;
        //const py:number = rb.translation().y + dir.y * 0.5;
        
        const px:number = this.module.vis.position.x - dir.x * 0.5;
        const py:number = this.module.vis.position.y + dir.y * 0.5;
        
        const rbdesc:RigidBodyDesc = RigidBodyDesc.dynamic()
            .setTranslation(px, py)
            .setAngularDamping(0.5)
            .setLinearDamping(1.5)
            .setAdditionalMassProperties(
                0.1,                // Mass.
                { x: 0.0, y: 0.0 }, // Center of mass.
                0.3                 // Principal angular inertia.
            );
        
        const rbp:RigidBody = this.world.createRigidBody(rbdesc);

        if( this.addCollidersToParts)
        {
            // group 2 : 0b0000 0000 0000 0100
            // collide with 0: 0b0000 0000 0000 0001
            let colliderDesc:ColliderDesc;
            const ss:number = this.psize * pscale;
            if( this.variant == 0 )
            {
                colliderDesc = ColliderDesc.ball(ss * .5)
            }
            else if( this.variant == 1)
            {
                colliderDesc = ColliderDesc.cuboid(ss*.5, ss*.5);
                
            }
            else if( this.variant == 2)
            {
                // equilateral triangle
                const triHeight:number = ss * 0.86602540378;
                colliderDesc = ColliderDesc.convexHull(new Float32Array([-ss/2, -triHeight/2, ss/2, -triHeight/2, 0, triHeight/2]) );
                
            }
            else if( this.variant == 3)
            {
                //regular hexagon
                const hexHeight:number = ss * 0.86602540378;
                const hexWidth:number = ss * 0.5;
                colliderDesc = ColliderDesc.convexHull(new Float32Array([-hexWidth, 0, -hexWidth/2, -hexHeight, hexWidth/2, -hexHeight, hexWidth, 0, hexWidth/2, hexHeight, -hexWidth/2, hexHeight]) );
            }
            this.addColliderProperties(colliderDesc);
            const collider:Collider = this.world.createCollider(colliderDesc, rbp);
            rbp.setRotation(normforce.angle(), false);
            
        }
        
        //rb.userData = {color:new Color().setHSL(Rand.rand(),1,.5)};
        const strJitter:number = 0;//Rand.fBetween(-0.05, 0.05);
        force.multiplyScalar(50).multiplyScalar(1 + strJitter);
        rbp.setLinvel({x:force.x, y:force.y }, true);
        this.scales.push(pscale);
        this.levels.push( Rand.fBetween(0,.9));
        this.colors.push( Rand.option(this.colorOptions) );
        this.particles.push(rbp);

    }

    addColliderProperties( collider:ColliderDesc)
    {
        collider.setRestitution(0.5);
        collider.setRestitutionCombineRule(CoefficientCombineRule.Min);
        collider.setCollisionGroups(this.collisionGroup);
    }

    dispose()
    {
        this.topMaterial.dispose();
        this.bottomMaterial.dispose();
        this.topIMesh.dispose();
        this.bottomIMesh.dispose();
        this.particles = null;
        this.scales = null;
        this.colors = null;
        this.levels = null;
        this.dummy = null;
        this.world = null;
        this.module = null;
    }
}

export { OutlineParts };