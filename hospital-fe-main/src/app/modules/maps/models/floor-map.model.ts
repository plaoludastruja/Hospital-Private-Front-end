import { Floor } from "./floor.model";

export class FloorMap {
    id: string = '';
    description: string = '';
    name: string = '';    
    number: number = 0;
    floor: Floor = new Floor();

    public constructor(obj?: any) {
        if (obj) {  
        }
    }
}
