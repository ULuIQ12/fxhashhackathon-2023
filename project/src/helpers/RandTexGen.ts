import { DataTexture, Texture, RedFormat, UnsignedByteType, UVMapping, RepeatWrapping } from 'three';
import { Rand } from './Rand';


class RandTexGen{

    static SIZE = 512;
    static Texture:any = -1;
    static GetTex()
    {
        if( RandTexGen.Texture == -1)
        {
            this.GenerateTex();
        }
        return RandTexGen.Texture;
    }

    static GenerateTex()
    {
        const size = this.SIZE * this.SIZE;
        const data = new Uint8Array(size);
        for(let i=0;i<size;i++)
        {
            data[i] = Rand.iBetween(0,256);
        }
        RandTexGen.Texture = new DataTexture(
            data,
            this.SIZE,
            this.SIZE,
            RedFormat,
            UnsignedByteType,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
        );
        RandTexGen.Texture.needsUpdate = true;
    }

    static GetUniqueTex():Texture
    {
        const size = this.SIZE * this.SIZE;
        const data = new Uint8Array(size);
        for(let i=0;i<size;i++)
        {
            data[i] = Rand.iBetween(0,256);
        }
        const tex = new DataTexture(
            data,
            this.SIZE,
            this.SIZE,
            RedFormat,
            UnsignedByteType,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
        );
        tex.needsUpdate = true;
        return tex;
    }

    static getAltTex():Texture
    {
        const size = this.SIZE * this.SIZE;
        const data = new Uint8Array(size);
        for(let i=0;i<size;i++)
        {
            data[i] = Rand.aiBetween(0,256);
        }
        const tex = new DataTexture(
            data,
            this.SIZE,
            this.SIZE,
            RedFormat,
            UnsignedByteType,
            UVMapping,
            RepeatWrapping,
            RepeatWrapping,
        );
        tex.needsUpdate = true;
        return tex;
    }
}

export { RandTexGen };