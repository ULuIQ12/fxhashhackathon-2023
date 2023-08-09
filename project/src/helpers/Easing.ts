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
    }

    export {Easing};