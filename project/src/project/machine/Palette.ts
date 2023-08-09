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
        [0xfdf0d5, 0x780000, 0xc1121f, 0x003049, 0x669bbc], // 2 red 2 blue
        [0xf9f0de, 0x1d1d1d, 0x224870, 0xd83715, 0xf7f8e6], // SY Brubeck
        [0xfffeff, 0xa58c68, 0x2f2a26, 0x8c847a, 0xdf3f36], // SY Edo
        [0xffffff, 0xdd0000, 0x990000, 0x333333, 0x000000], // red and black
        [0xfffcf2, 0xccc5b9, 0x403d39, 0x252422, 0xeb5e28], // greys and orange
        [0xe0e1dd, 0x778da9, 0x415a77, 0x1b263b, 0x0d1b2a], // blue grey
        [0xedddd4, 0x197278, 0x283d3b, 0xc44536, 0x772e25], // turquoise red
        [0xfaf0ca, 0xf4d35e, 0xee964b, 0xf95738, 0x0d3b66], // orange  and 1 blue
        [0xeff7f6, 0x7bdff2, 0xb2f7ef, 0xf7d6e0, 0xf2b5d4], // pastel pink and blue
        [0xfef9ef, 0x227c9d, 0x17c3b2, 0xffcb77, 0xfe6d73], // blue, green, orange, salmon
        [0xffffff, 0x00171f, 0x003459, 0x007ea7, 0x00a8e8], // white balck blue
        [0xffffff, 0x2d3142, 0xbfc0c0, 0xef8354, 0x4f5d75], // white grey orange blue
        [0xffffff, 0xe5e5e5, 0xfca311, 0x14213d, 0x000000], // white grey orange blue
        [0xffffff, 0x222222, 0xAAAAAA, 0x1f9fa7, 0xa7cf2d], // iq12
        [0xffffff, 0xff9f1c, 0xffbf69, 0xcbf3f0, 0x2ec4b6], //  white orange turquoise
        [0x2b2d42, 0x8d99ae, 0xedf2f4, 0xef233c, 0xd90429], // blue grey pink red
        [0x461220, 0x8c2f39, 0xb23a48, 0xfcb9b2, 0xfed0bb], // red pink
        [0x0c0f0a, 0xff206e, 0xfbff12, 0x41ead4, 0xffffff], // black pink yellow blue white
        [0x202c39, 0x283845, 0xb8b08d, 0xf2d492, 0xf29559], // blue grey yellow orange
        [0x586ba4, 0x324376, 0xf5dd90, 0xf68e5f, 0xf76c5e], // blue orange
        [0x0b132b, 0x1c2541, 0x3a506b, 0x5bc0be, 0x6fffe9], // blue turquoise
        [0xf7ec00, 0xfc1c5b, 0x004b87, 0x03e0e2, 0x009677], // cyber
        

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
        msg[Project.PALETTE_PARAM_ID] = BigInt( p );

        if( Project.GetContext() == FXContext.MINTING )
            Project.instance.snippet.emit(Params.UPDATE_SIGNAL,msg);

        //console.log( "Update palette param : ", msg);

    }
}

export { Palette };