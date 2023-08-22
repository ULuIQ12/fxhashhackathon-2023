import { Color } from "three";
import { Params } from "../../helpers/Params";
import { Project } from "../Project";
import { FXContext } from "../../helpers/FXSnippet";

class Palette
{
    static background:Color;
    static colors:Color[];
    static selectedPalette:number = 0;
    static paletteValues:number[][] = [
        [0xffffff, 0x000000, 0x000000, 0x000000, 0x000000], // black and white
        [0x000000, 0xffffff, 0xffffff, 0xffffff, 0xffffff], // white and black
        [0x10467b, 0xffffff, 0xffffff, 0xffffff, 0xffffff], // blueprint
        [0xfffeff, 0xa58c68, 0x2f2a26, 0x8c847a, 0xdf3f36], // SY Edo
        [0xffffff, 0xdd0000, 0x990000, 0x333333, 0x000000], // red and black
        [0xfffcf2, 0xccc5b9, 0x403d39, 0x252422, 0xeb5e28], // greys and orange
        [0xe0e1dd, 0x778da9, 0x415a77, 0x1b263b, 0x0d1b2a], // blue grey
        [0xf9f0de, 0x1d1d1d, 0x224870, 0xd83715, 0xf7f8e6], // SY Brubeck
        [0xfdf0d5, 0x780000, 0xc1121f, 0x003049, 0x669bbc], // 2 red 2 blue
        [0xeff7f6, 0x7bdff2, 0xb2f7ef, 0xf7d6e0, 0xf2b5d4], // pastel pink and blue
        [0xffffff, 0x00171f, 0x003459, 0x007ea7, 0x00a8e8], // white balck blue
        [0xffffff, 0x2d3142, 0xbfc0c0, 0xef8354, 0x4f5d75], // white grey orange blue
        [0xffffff, 0xe5e5e5, 0xfca311, 0x14213d, 0x000000], // white grey orange blue
        [0xffffff, 0x222222, 0xAAAAAA, 0x1f9fa7, 0xa7cf2d], // iq12
        [0xffffff, 0xff9f1c, 0xffbf69, 0xcbf3f0, 0x2ec4b6], //  white orange turquoise
        [0xfef9ef, 0x227c9d, 0x17c3b2, 0xffcb77, 0xfe6d73], // blue, green, orange, salmon
        [0xfaf0ca, 0xf4d35e, 0xee964b, 0xf95738, 0x0d3b66], // orange  and 1 blue
        [0xffe7cc, 0xff185e, 0xf01d5d, 0xff653d, 0x190000], // clutch miami
        [0xffedcc, 0x10100f, 0x3b194b, 0x7c34b7, 0x9748ba], // clutch shaft
        [0xffe9c6, 0x211110, 0xef3c32, 0xf76635, 0xffd321], // clutch fury
        [0xfffcce, 0x3a3723, 0x373ad0, 0xff2b56, 0xffe43c], // clutch svelto
        [0xf0dfc2, 0xffffd6, 0xff6835, 0x6690d5, 0x6c4b67], // clutch i don't remember
        [0xf0dfc2, 0x25101d, 0xd249d7, 0x708497, 0x5fd2be], // clutch superfly
        [0xedddd4, 0x197278, 0x283d3b, 0xc44536, 0x772e25], // turquoise red
        [0x339fcd, 0x142127, 0x165975, 0xff4c00, 0xffffff], // blue  orange white
        [0xf7ec00, 0xfc1c5b, 0x004b87, 0x03e0e2, 0x009677], // cyber 
        [0x202c39, 0x283845, 0xb8b08d, 0xf2d492, 0xf29559], // blue grey yellow orange
        [0x2b2d42, 0x8d99ae, 0xedf2f4, 0xef233c, 0xd90429], // blue grey pink red
        [0x461220, 0x8c2f39, 0xb23a48, 0xfcb9b2, 0xfed0bb], // red pink
        [0x586ba4, 0x324376, 0xf5dd90, 0xf68e5f, 0xf76c5e], // blue orange
        [0x0b132b, 0x1c2541, 0x3a506b, 0x5bc0be, 0x6fffe9], // blue turquoise
        [0x06082e, 0xff8eff, 0xff08c8, 0x1b19e6, 0x33c2ff], // dark blue pink
        [0x111111, 0xff206e, 0xfbff12, 0x41ead4, 0xffffff], // black pink yellow blue white
        

        

        

    ];

    static RandomizePalette():void 
    {
        this.SetupPalette( Math.floor(Math.random()*this.paletteValues.length) );
    }

    static SetupPalette(p:number = 0):void
    {
        Palette.selectedPalette = p;
        
        const pal:number[] = Palette.paletteValues[p];
        Palette.background = new Color(pal[0]).convertLinearToSRGB();
        Palette.colors = [
            new Color(pal[1]).convertLinearToSRGB(),
            new Color(pal[2]).convertLinearToSRGB(),
            new Color(pal[3]).convertLinearToSRGB(),
            new Color(pal[4]).convertLinearToSRGB(),
        ];

        const msg:{} = {};
        //msg[Project.PALETTE_PARAM_ID] = BigInt( p );
        msg[Project.PALETTE_PARAM_ID] = p ;

        if( Project.GetContext() == FXContext.MINTING )
            Project.instance.snippet.emit(Params.UPDATE_SIGNAL,msg);

        //console.log( "Update palette param : ", msg);

    }

    static GetInterpolatedColor( t:number, target:Color = new Color() ):Color
    {
        const c0:Color = new Color();
        const c1:Color = new Color();
        let d:number = 0;
        if( t < .25)
        {
            c0.copy(Palette.colors[0]);
            c1.copy(Palette.colors[1]);
            d = t/.25;
        }
        else if( t < .5)
        {
            c0.copy(Palette.colors[1]);
            c1.copy(Palette.colors[2]);
            d = (t-.25)/.25;
        }
        else if( t < .75)
        {
            c0.copy(Palette.colors[2]);
            c1.copy(Palette.colors[3]);
            d = (t-.5)/.25;
        }
        else 
        {
            c0.copy(Palette.colors[3]);
            c1.copy(Palette.colors[0]);
            d = (t-.75)/.25;
        }
        
        return target.copy( c0).lerp(c1, d );
    }
}

export { Palette };