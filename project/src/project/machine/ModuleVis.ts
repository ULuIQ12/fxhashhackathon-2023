import { BoxGeometry, BufferGeometry, Color, Euler, Group, MathUtils, Mesh, MeshBasicMaterial, Texture, Vector3 } from "three";
import { ModConfig, Module, ModuleOrientation, ModuleType } from "./structs/Module";
import { ModuleMaterial } from "./materials/ModuleMaterial";
import { Assets } from "../../helpers/Assets";
import { Designer } from "../Designer";
import { Easing } from "../../helpers/Easing";
import { Project } from "../Project";

class ModuleVis extends Group
{
    static VIS_MAT:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true});
    static HIGHLIGHT_MAT:MeshBasicMaterial = new MeshBasicMaterial({color:new Color().setHSL(.5,1,.6), opacity:.9, transparent:true});

    static SIZE:number = 1;
    static hashCount:number = 0;
    position:Vector3;
    localToWorld:any;
    updateMatrix:any;
    updateMatrixWorld:any;
    parent:any;
    hash:number;
    type:ModuleType = ModuleType.Empty;
    moduleRef:Module;
    mesh:Mesh;
    hightlightMesh:Mesh;
    mat:MeshBasicMaterial;
    rotation:Euler;
    lastOrientation:ModuleOrientation = ModuleOrientation.Up;
    lastConfig:ModConfig = null;
    additionalRotation:number = 0 ;
    getWorldPosition:any;
    visible:boolean;

    targetScale:number = 1 ;

    positionTransition:number = 0 ;
    targetPosition:Vector3 = new Vector3();
    
    constructor(type:number, rtype:ModuleType)
    {
        super();
        this.hash = ModuleVis.hashCount++;
        const s:number = ModuleVis.SIZE * .9;
        const geom:BoxGeometry = new BoxGeometry(s,s,s);
        
        this.type = ModuleType[Object.keys(ModuleType)[type]];
        
        if( Assets.LoadedIcons[rtype] == undefined)
            this.visible = false;
            
        this.mat = ModuleVis.VIS_MAT.clone();
        this.mat.map = Assets.GetModuleIconTexture(rtype, this.onTextureLoaded);
        this.mat.needsUpdate = true;

        this.mesh = new Mesh(geom, this.mat);
        super.add(this.mesh);

        const s2:number = ModuleVis.SIZE * .95;
        const hgeom:BufferGeometry = new BoxGeometry(s2, s2, s2);
        this.hightlightMesh = new Mesh(hgeom, ModuleVis.HIGHLIGHT_MAT);
        this.hightlightMesh.position.z = -.5;
        this.hightlightMesh.visible = false;
        super.add(this.hightlightMesh);

        

    }

    onTextureLoaded = (tex:Texture) => {
        
        this.mat.map = tex;
        this.mat.needsUpdate = true;
        this.visible = true;
    }

    highlight(value:boolean  =false)
    {
        if( Designer.instance.currentMode != "build")
            return;
        
        if( value ) 
        {
            this.targetScale = 1.05;
            document.getElementsByTagName("body")[0].style.cursor = "pointer";
        }
        else
        {
            this.targetScale = 1;
            document.getElementsByTagName("body")[0].style.cursor = "auto";
        }
        //this.hightlightMesh.visible = value;
    }

    rollOver()
    {   
        this.highlight(true);
    }

    rollOut()
    {
        this.highlight(false);
    }

    resetRotation()
    {
        this.additionalRotation = 0;
        const targetRot:number = Module.orientationToAngle(this.moduleRef.orientation);
        this.mesh.rotation.z = targetRot;
        this.rotation.z = 0 ;
    }

    destroyTime:number = -1 ;
    destroy()
    {
        Project.RegisterAnimElem(this);
        this.destroyTime = 1 ;
    }

    update(dt:number, elapsed:number)
    {

        const meshRot:number = this.mesh.rotation.z;
        
        const targetRot:number = Module.orientationToAngle(this.moduleRef.orientation);
        if( targetRot == undefined)
            return;

        
        this.lastOrientation = this.moduleRef.orientation;
        this.lastConfig = this.moduleRef.config;
        
        let rot:number = targetRot - meshRot + this.additionalRotation;
        
        if( rot > Math.PI)
        {
            rot -= Math.PI * 2;
        }
        else if( rot < -Math.PI)
        {
            rot += Math.PI * 2;
        }
        const d:number = MathUtils.lerp(meshRot, meshRot + rot, dt * 10);
        
        this.mesh.rotation.z = d;

        if( this.positionTransition > 0)
        {
            this.position.lerp(this.targetPosition, .5);
            this.positionTransition -= .1;
            
            if( this.positionTransition <= 0)
                this.position.copy(this.targetPosition);
        }
        else 
            this.targetPosition.copy(this.position);

        if( this.destroyTime ==-1 )
        {
            const scaleVal:number = MathUtils.lerp(this.mesh.scale.x, this.targetScale, dt * 20);
            this.mesh.scale.setScalar(scaleVal);
        }
        else 
        {
            this.destroyTime -= dt * 5;
            const scaleVal:number = Easing.easeOutBack(this.destroyTime);
            this.mesh.scale.setScalar(scaleVal);
            if( this.destroyTime <=0)
            {
                this.destroyTime = -1;
                this.parent.remove(this);
                Project.UnregisterAnimElem(this);
            }

        }
    }
}

export {ModuleVis};