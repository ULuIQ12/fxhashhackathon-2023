import { BoxGeometry, Vector3, Texture, Object3D, BufferGeometry, InstancedMesh, DoubleSide, Group, Line, LineDashedMaterial, MathUtils, Mesh, MeshBasicMaterial, Path, PlaneGeometry, Vector2, Color,TextureLoader,AdditiveBlending } from "three";
import { GridMaterial } from "./materials/GridMaterial";
import { Designer } from "../Designer";
import { Palette } from "./Palette";
import { Project } from "../Project";
import { Module, ModuleType } from "./structs/Module";
import { off } from "process";

class Grid extends Group
{
    opacity:number = 0;
    position:Vector3;
    gridMaterial:MeshBasicMaterial;
    buildArea:Group;
    links:GridLink[] = [];
    add:any;
    
    constructor()
    {
        super();
        //const gridColor:Color = new Color().setHSL(.65, .6,.45);0x0e60ac
        const gridColor:Color = new Color(0x0e60ac).convertLinearToSRGB();
        this.gridMaterial = new GridMaterial({color:gridColor});
        //this.gridMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true});
        //this.gridMaterial = new MeshBasicMaterial({color:Palette.background, transparent:true});
        const geom:BufferGeometry = new PlaneGeometry(100,100,100,100);
        const m:Mesh = new Mesh(geom, this.gridMaterial);
        m.position.x += 0.5;
        m.position.y += 0.5;
        
        //m.rotateX(-Math.PI/2);
        super.add(m);

        /*
        const limitGeom:BufferGeometry = new BoxGeometry(Designer.SPACE_SIZE, .1, 1);
        const limitMat:MeshBasicMaterial = new MeshBasicMaterial({color:0xFF0000});
        const limit:Mesh = new Mesh(limitGeom, limitMat);
        const dirs:Vector2[] = [new Vector2(0,1), new Vector2(0,-1), new Vector2(1,0), new Vector2(-1,0)];
        const buildArea:Group = new Group();
        for( let i:number=0;i<dirs.length;i++)
        {
            const d:Vector2 = dirs[i];
            const l:Mesh = limit.clone();
            l.position.set(d.x * Designer.SPACE_SIZE/2, d.y * Designer.SPACE_SIZE/2, 0);
            l.rotateZ(Math.atan2(d.x, d.y));
            buildArea.add(l);
        }
        super.add(buildArea);
        this.buildArea = buildArea;*/
        const buildArea:Group = new Group();
        super.add(buildArea);
        this.buildArea = buildArea;

        //const areaMat:LineDashedMaterial = new LineDashedMaterial({color:0x24272e, dashSize:.1, gapSize:.04, transparent:true});
        const areaMat:LineDashedMaterial = new LineDashedMaterial({color:0xFFFFFF, dashSize:.1, gapSize:.04, transparent:true});
        const path:Path = new Path();
        const cornerSize:number = 0.1;
        const size:number = Designer.SPACE_SIZE/2;
        path.moveTo(-size + cornerSize, -size);
        path.lineTo(size - cornerSize, -size);
        path.quadraticCurveTo(size, -size, size, -size + cornerSize);
        path.lineTo(size, size - cornerSize);
        path.quadraticCurveTo(size, size, size - cornerSize, size);
        path.lineTo(-size + cornerSize, size);
        path.quadraticCurveTo(-size, size, -size, size - cornerSize);
        path.lineTo(-size, -size + cornerSize);
        path.quadraticCurveTo(-size, -size, -size + cornerSize, -size);
        path.closePath();
        
        
        const areageom:BufferGeometry = new BufferGeometry().setFromPoints(path.getPoints());
        const area:Line = new Line(areageom, areaMat);
        area.computeLineDistances();
        this.buildArea.add(area);

        for( let i:number = 1 ;i< Designer.SPACE_SIZE;i++)
        {
            const horizontalLinePts:Vector2[] = [
                new Vector2(-Designer.SPACE_SIZE/2, i - Designer.SPACE_SIZE/2),
                new Vector2(Designer.SPACE_SIZE/2, i - Designer.SPACE_SIZE/2)
            ]
            const horizontalLineGeom:BufferGeometry = new BufferGeometry().setFromPoints(horizontalLinePts);
            const horizontalLine:Line = new Line(horizontalLineGeom, areaMat);
            horizontalLine.computeLineDistances();
            this.buildArea.add(horizontalLine);
            for( let j:number = 1 ;j< Designer.SPACE_SIZE;j++)
            {
                const verticalLinePts:Vector2[] = [
                    new Vector2(j - Designer.SPACE_SIZE/2, -Designer.SPACE_SIZE/2),
                    new Vector2(j - Designer.SPACE_SIZE/2, Designer.SPACE_SIZE/2)
                ]
                const verticalLineGeom:BufferGeometry = new BufferGeometry().setFromPoints(verticalLinePts);
                const verticalLine:Line = new Line(verticalLineGeom, areaMat);
                verticalLine.computeLineDistances();
                this.buildArea.add(verticalLine);
            }
        }
        

        const titleMat:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true, opacity:0.95});
        titleMat.map = new TextureLoader().load("./assets/bptitle2.png");
        const s:number = 0.0058; 
        //const titleGeom:BufferGeometry = new PlaneGeometry(1059 * s,180 * s,1,1);
        const titleGeom:BufferGeometry = new PlaneGeometry(1200 * s,126 * s,1,1);
        const title:Mesh = new Mesh(titleGeom, titleMat);
        title.frustrumCulled = false;
        title.position.z = 1.0;
        title.position.y = 4.1;
        this.buildArea.add(title);

        const iterationWidth:number = 512;
        const iterationHeight:number = 256;
        const iterationBitmap:HTMLCanvasElement = document.createElement('canvas');
        const canvas2d:CanvasRenderingContext2D = iterationBitmap.getContext('2d');
        iterationBitmap.width = iterationWidth;
        iterationBitmap.height = iterationHeight;
        iterationBitmap.style.width = iterationBitmap.width + "px";
        iterationBitmap.style.height = iterationBitmap.height + "px";
        
        canvas2d.font = 'normal normal normal 200px CabinSketch'; //67
        canvas2d.fillStyle = 'white';
        canvas2d.strokeStyle = 'white';
        canvas2d.textAlign = "center";
        canvas2d.textBaseline = "middle";        
        canvas2d.imageSmoothingEnabled = true;
        const iterationText:string = "#" +  Project.instance.snippet.iteration.toString().padStart(3, "0");
        canvas2d.fillText( iterationText, iterationBitmap.width / 2, iterationBitmap.height / 2);

        const iterationTexture:Texture = new Texture(iterationBitmap);
        iterationTexture.needsUpdate = true;
        const scale:number = 0.002;
        const sx:number = iterationWidth * scale;
        const sy:number = iterationHeight * scale;
        
        const iterationGeom:BufferGeometry = new PlaneGeometry(sx, sy ,1,1);
        const iterationMat:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true, opacity:0.95, map:iterationTexture});

        
        const iteration:Mesh = new Mesh(iterationGeom, iterationMat);
        iteration.frustrumCulled = false;
        iteration.position.set(4 - sx, -4, 1.0)

        this.buildArea.add(iteration);
        
        this.createLinks();
    }


    createLinks()
    {
        

        const linkGeometry:PlaneGeometry = new PlaneGeometry(.15, .2, 1, 1);
        const linkTex:Texture = new TextureLoader().load("./assets/link.png");
        const linkMat:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF,transparent:true, opacity:0, map:linkTex});
       
        for( let j:number = 0 ;j < Designer.SPACE_SIZE;j++)
        {
            for( let i:number = 0 ;i < Designer.SPACE_SIZE; i++)
            {
                const linkMeshV:Mesh = new Mesh(linkGeometry, linkMat.clone());
                linkMeshV.position.z = 0.1;
                const glv:GridLink = new GridLink();
                glv.mesh = linkMeshV;
                glv.mesh.position.x = i - Designer.SPACE_SIZE/2 + 1;
                glv.mesh.position.y = j - Designer.SPACE_SIZE/2 + 0.5;
                
                if(  i == Designer.SPACE_SIZE - 1)
                    glv.mesh.visible = false;
                else 
                {
                    this.buildArea.add(linkMeshV)
                }

                this.links.push(glv);
                

                const linkMeshH:Mesh = new Mesh(linkGeometry, linkMat.clone());
                linkMeshH.position.z = 0.1;
                const glh:GridLink = new GridLink();
                glh.mesh = linkMeshH;
                glh.mesh.position.x = i - Designer.SPACE_SIZE/2 + 0.5;
                glh.mesh.position.y = j - Designer.SPACE_SIZE/2 + 1;
                glh.mesh.rotation.z = Math.PI/2;
                
                
                if(  j == Designer.SPACE_SIZE - 1)
                    glh.mesh.visible = false;
                else 
                {
                    this.buildArea.add(linkMeshH);
                }
                this.links.push(glh);
            }   
        }


    }


    updateLinks(m:Module[])
    {
        for( let i:number = 0 ;i< m.length;i++)
        {
            const module:Module = m[i];
            const linkTop:GridLink = this.links[i*2];
            const linkRight:GridLink = this.links[i*2+1];
            const top:Module = m[this.gridToModuleIndex(module.position.x, module.position.y + 1)];
            const right:Module = m[this.gridToModuleIndex(module.position.x + 1, module.position.y)];

            if( module.type == ModuleType.Empty)
            {
                linkTop.hide();
                linkRight.hide();
                continue;
            }
            if( right && right.type != ModuleType.Empty)
                linkTop.show();
            else
                linkTop.hide();
            
            if( top && top.type != ModuleType.Empty)
                linkRight.show();
            else
                linkRight.hide();
        }
    }

    contrapTitleContainer:Group;
    titleMat:MeshBasicMaterial;
    updateContraptionTitle(newtitle:string, instant:boolean = false)
    {
        if( this.contrapTitleContainer == undefined)
        {
            this.contrapTitleContainer = new Group();
            this.buildArea.add(this.contrapTitleContainer);
        }

        if( this.contrapTitleContainer.children.length > 0)
        {
            while( this.contrapTitleContainer.children.length > 0)
            {
                const child:Mesh = this.contrapTitleContainer.children[0] as Mesh;
                child.material.dispose();
                child.geometry.dispose();
                this.contrapTitleContainer.remove(child);
            }
        }

        const titleWidth:number = 2048;
        const titleHeight:number = 128;
        const titleBitmap:HTMLCanvasElement = document.createElement('canvas');
        const canvas2d:CanvasRenderingContext2D = titleBitmap.getContext('2d');
        titleBitmap.width = titleWidth;
        titleBitmap.height = titleHeight;
        titleBitmap.style.width = titleBitmap.width + "px";
        titleBitmap.style.height = titleBitmap.height + "px";
        
        canvas2d.font = 'normal normal normal 100px CabinSketch'; //67
        canvas2d.fillStyle = 'white';
        canvas2d.strokeStyle = 'white';
        canvas2d.textAlign = "right";
        canvas2d.textBaseline = "middle";        
        canvas2d.imageSmoothingEnabled = true;
        const titleText:string = newtitle;
        canvas2d.fillText( titleText, titleBitmap.width, titleBitmap.height / 2);

        const titleTexture:Texture = new Texture(titleBitmap);
        titleTexture.needsUpdate = true;
        const scale:number = 0.003;
        const sx:number = titleWidth * scale;
        const sy:number = titleHeight * scale;
        
        const titleGeom:BufferGeometry = new PlaneGeometry(sx, sy ,1,1);
        const titleMat:MeshBasicMaterial = new MeshBasicMaterial({color:0xFFFFFF, transparent:true, opacity:(instant?.9:0), map:titleTexture});
        this.titleMat = titleMat;
        
        const title:Mesh = new Mesh(titleGeom, titleMat);
        title.frustrumCulled = false;
        //title.position.set(4.5 - sx , -4, 1.0);
        title.position.set( 3.5-sx/2 , -4.35, 1.0);
        this.contrapTitleContainer.add(title);

    }

    gridToModuleIndex(px:number, py:number):number
    {
        const index:number = px + py * Designer.SPACE_SIZE;
        return index;
    }
   

    show()
    {
        this.opacity = 1;
        this.buildArea.visible = true;
    }

    hide()
    {
        this.opacity = 0;
        this.buildArea.visible = false;
    }

    update( dt:number, elapsed:number)
    {
        const d:number = MathUtils.lerp(this.gridMaterial.opacity, this.opacity, dt * 5);
        this.gridMaterial.opacity = d;
        if( d <= 0 && this.buildArea.visible && this.opacity <= 0)
            this.buildArea.visible = false;
        else if( d > 0 && !this.buildArea.visible && this.opacity > 0)
            this.buildArea.visible = true;
        
        const c:Color = new Color();

        for( let i:number = 0 ;i< this.links.length;i++)
        {
            this.links[i].update(dt);
        }

        if( this.titleMat != undefined)
        {
            if( this.titleMat.opacity < 0.9)
                this.titleMat.opacity += dt * 10;

        }
    }
}

class GridLink
{
    mesh:Mesh;
    opacity:number = 0;
    targetOpacity:number = 0;
    

    show()
    {
        this.targetOpacity = 1;
    }

    hide()
    {
        this.targetOpacity = 0;
    }

    update(dt:number)
    {
        let d:number = MathUtils.lerp(this.opacity, this.targetOpacity, .1);
        if( d < 0.1)
            d =0;
        this.opacity = d;
        if( this.opacity != this.mesh.material.opacity)
            this.mesh.material.opacity = d;
    }
}



export {Grid};