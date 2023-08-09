class Rand
{
    static prng:Function;
    static altPrng:Function;

    static Init( func:Function, altFunc?:Function )
    {
        Rand.prng = func;
        if( altFunc ) Rand.altPrng = altFunc;
    }

    static rand():number
    {
        return Rand.prng();
    }

    static fBetween( min:number, max:number ):number
    {
        return min + Rand.rand() * (max - min);
    }

    static iBetween( min:number, max:number ):number
    {
        return Math.floor( Rand.fBetween( min, max ) );
    }

    static option(option:any[]):any
    {
        return option[Rand.iBetween(0, option.length)];
    }

    static bool(weight:number):boolean
    {
        if (isNaN(weight)) weight = .5;
        return Rand.rand() < weight;
    }
    ////////////////////////////////////////////
    static arand():number
    {
        return Rand.altPrng();
    }

    static afBetween( min:number, max:number ):number
    {
        return min + Rand.arand() * (max - min);
    }

    static aiBetween( min:number, max:number ):number
    {
        return Math.floor( Rand.afBetween( min, max ) );
    }

    static aoption(option:any[]):any
    {
        return option[Rand.aiBetween(0, option.length)];
    }

    static abool(weight:number):boolean
    {
        if (isNaN(weight)) weight = .5;
        return Rand.arand() < weight;
    }
}

export {Rand};