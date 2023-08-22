import { FXSnippet } from "../helpers/FXSnippet";

class Params 
{
    static params:ParamDef[] = [];
    static snippet:FXSnippet;

    static UPDATE_SIGNAL = "params:update";


    
    static setSnippet(snippet:FXSnippet)
    {
        this.snippet = snippet;
    }
    static addFloat(id:string, name:string, update:UpdateType,  min:number, max:number, step?:number, defaultVal?:number)
    {
        const p:FloatParam = new FloatParam(id, name, update, min, max ,step, defaultVal);
        this.params.push( p );
    }
    static addInt(id:string, name:string, update:UpdateType, min:number, max:number, defaultVal?:bigint)
    {
        const p:IntParam = new IntParam(id, name, update, min, max , defaultVal);
        this.params.push( p );
    }
    static addBool(id:string, name:string, update:UpdateType, defaultVal?:boolean)
    {
        const p:BoolParam = new BoolParam(id, name, update, defaultVal);
        this.params.push( p );
    }
    static addSelect(id:string, name:string, update:UpdateType, options:string[])
    {
        const p:SelectParam = new SelectParam(id, name, update, options);
        this.params.push( p );
    }

    static addString(id:string, name:string, update:UpdateType, defaultVal?:string, minLen?:number, maxLen?:number)
    {
        const p:StringParam = new StringParam(id, name, update, defaultVal, minLen, maxLen);
        this.params.push( p);
    }
    
    static getParam(id:string):any
    {
        return this.snippet.getParam(id);
    }
}

enum UpdateType
{
    PAGE_RELOAD="page-reload",
    SYNC="sync",
    CODE_DRIVEN="code-driven"
}

class ParamDef
{
    id: string; // required
    name?: string; // optional, if not defined name == id
    update:UpdateType;
    type: "number" | "bigint" | "boolean" | "color" | "string" | "select"; // required
    default?: string | number | bigint | boolean; // optional (see Randomization)
    options:Object;
}
class FloatParam extends ParamDef
{
    constructor(id:string, name:string, update:UpdateType, min:number, max:number, step?:number, defaultVal?:number)
    {
        super();
        this.id = id;
        this.name = name;
        this.type = "number";
        this.update = update;
        this.default = defaultVal;
        
        this.options = {
            min:min,
            max:max,
            step:step
        }
    }
}

class IntParam extends ParamDef
{
    constructor(id:string, name:string, update:UpdateType,min:number, max:number, defaultVal?:bigint)
    {
        super();
        this.id = id;
        this.name = name;
        this.type = "bigint";
        this.update = update;
        this.default = defaultVal;
        
        this.options = {
            min:BigInt(min),
            max:BigInt(max),
        }
    }
}

class BoolParam extends ParamDef
{
    constructor(id:string, name:string, update:UpdateType,defaultVal?:boolean)
    {
        super();
        this.id = id;
        this.name = name;
        this.type = "boolean";
        this.update = update;
        this.default = defaultVal;
        
    }
}

class SelectParam extends ParamDef
{
    constructor(id:string, name:string, update:UpdateType, options:string[], defaultVal?:number)
    {
        super();
        this.id = id;
        this.name = name;
        this.type = "select";
        this.update = update;
        this.default = defaultVal;
        this.options = 
        {
            options:options
        };
    }
}

class StringParam extends ParamDef
{
    constructor(id:string, name:string, update:UpdateType, defaultVal?:string, minLen?:number, maxLen?:number)
    {
        super();
        this.id = id;
        this.name = name;
        this.type = "string";
        this.update = update;
        this.default = defaultVal;
        this.options = {
            minLength:minLen,
            maxLength:maxLen
        }
    }
}

export {Params, UpdateType};