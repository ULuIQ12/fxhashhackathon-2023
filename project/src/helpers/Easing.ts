    class Easing
    {
        static easeInBack(x:number):number 
        {
            const c1 = 1.70158;
            const c3 = c1 + 1;            
            return c3 * x * x * x - c1 * x * x;    
        }

        static easeOutBack(x:number):number
        {
            const c1 = 1.70158;
            const c3 = c1 + 1;            
            return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
            
        }

        static easeInCubic(x:number):number 
        {
            return x * x * x;
        }

        static easeInCirc(x:number):number
        {
            return 1 - Math.sqrt(1 - Math.pow(x, 2));
        }

        static easeInOutCirc(x: number): number 
        {
            return x < 0.5
                ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
                : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;        
        }

        static easeOutCubic(x:number):number
        {
            return 1 - Math.pow(1 - x, 3);
        }

        static easeInSine(x:number):number
        {
            return 1 - Math.cos((x * Math.PI) / 2); 
        }

        static easeOutSine(x:number):number 
        {
            return Math.sin((x * Math.PI) / 2);
        }

        static easeInOutSine(x:number):number
        {
            return -(Math.cos(Math.PI * x) - 1) / 2;
        }

        static easeInQuint(x:number):number
        {
            return x * x * x * x * x;     
        }
        
        static easeInExpo(x:number):number 
        {
            return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        }

        static easeInOutExpo(x:number):number
        {
            return x === 0
              ? 0
              : x === 1
              ? 1
              : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2
              : (2 - Math.pow(2, -20 * x + 10)) / 2;
            
        }
    }

    export {Easing};