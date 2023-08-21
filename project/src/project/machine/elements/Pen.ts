import { Group, LineBasicMaterial, BufferGeometry, BufferAttribute, Float32BufferAttribute, Vector3, Line, Color } from "three";
import { IElement } from "./IElement";
import { Module } from "../structs/Module";
import { PStreamMaterial } from "../materials/PStreamMaterial";
import { Rand } from "../../../helpers/Rand";
import { Palette } from "../Palette";

// with GL_Lines . Does not scale well, so was used for early testing only
class Pen extends Group implements IElement
{
    module: Module;

    material:LineBasicMaterial;
    geom:BufferGeometry;
    maxLength:number = 2000;
    lineWidth:number = 5;
    lineCount:number = 0 ;
    v0:Vector3 = new Vector3();
    steps:number = 0 ;
    color:Color;// = Rand.option( Palette.colors );
    constructor(m:Module)
    {
        super();
        this.module = m;

        this.init();
    }
    getProgress(): number {
        throw new Error("Method not implemented.");
    }
    isDrawingElement: boolean = false;

    init()
    {
        this.steps = 0 ;
        this.lineCount = 0;
        this.geom = new BufferGeometry();
        const verts:number[] = [];
        const colors:number[] = [];
        const alphas:number[] = [];
        for( let i:number = 0;i<this.maxLength;i++)
        {
            verts.push(0,0,0);
            colors.push(0,0,0);
            alphas.push(0);
        }
        this.geom.setAttribute("position", new Float32BufferAttribute(verts, 3));
        this.geom.setAttribute("color", new Float32BufferAttribute(colors, 3));
        this.geom.setAttribute("alpha", new Float32BufferAttribute(alphas, 1));

        this.material = new PStreamMaterial({color:0xFFFFFF, transparent:true, alphaTest:.5, vertexColors:true, linewidth:this.lineWidth});
        const mesh = new Line(this.geom, this.material);
        super.add(mesh);

    }

    update(dt: number, elapsed: number): void {
        if( this.steps%2==0)
            this.addPoint();

        const positions:BufferAttribute = this.geom.getAttribute("position") as BufferAttribute;
        const vert0:Vector3 = new Vector3().fromBufferAttribute(positions, this.lineCount-2);
        const vert1:Vector3 = new Vector3().fromBufferAttribute(positions, this.lineCount-3);
        const dist:number = vert0.distanceTo(vert1);
        if( dist > 10)
        {
            const alphas:BufferAttribute = this.geom.getAttribute("alpha") as BufferAttribute;
            alphas.setX(this.lineCount-2, 0);
            alphas.setX(this.lineCount-3, 0);

            alphas.needsUpdate = true;
        }
        this.steps++;
    }

    addPoint()
    {

        //this.v0.set(this.module.rb.translation().x, this.module.rb.translation().y, 0);
        this.v0.copy(this.module.vis.position);
        const positions:BufferAttribute = this.geom.getAttribute("position") as BufferAttribute;
        const colors:BufferAttribute = this.geom.getAttribute("color") as BufferAttribute;
        const alphas:BufferAttribute = this.geom.getAttribute("alpha") as BufferAttribute;

        positions.setXYZ(this.lineCount, this.v0.x, this.v0.y, this.v0.z);
        colors.setXYZ(this.lineCount, this.color.r, this.color.b, this.color.g);

        if( this.lineCount > 1)
            alphas.setX(this.lineCount -1 , 1);

        this.lineCount++;

        positions.needsUpdate = true;
        colors.needsUpdate = true;
        alphas.needsUpdate = true;
    }


    dispose()
    {
        this.material.dispose();
        this.geom.dispose();
        this.material = null;
        this.geom = null;
    }
    
}

export { Pen };