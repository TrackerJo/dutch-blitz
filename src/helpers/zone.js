export class ZoneObj {
    alternateColors;
    startAnywhere;
    descendingOrder;
    stack;
    cards;  
    suit;
    number;
    id;
    isPublic;
    cardObjs;


    constructor({cards, suit, number,alternateColors, startAnywhere, descendingOrder, id, stack, isPublic, cardObjs}) {
        this.alternateColors = alternateColors;
        this.startAnywhere = startAnywhere;
        this.descendingOrder = descendingOrder;
        this.cards = cards;
        this.suit = suit;
        this.number = number;
        this.id = id;
        this.stack = stack;
        this.isPublic = isPublic;
        this.cardObjs = cardObjs;
    }
}

export default class Zone {

    constructor(scene, zoneObj) {

        this.renderZone = (x,y, width, height) => {
            const cardWidth = width; // Base card width * scale + padding
            const cardHeight = height; // Base card height * scale + padding
            

            let dropZone;
            if(zoneObj.stack) {
                dropZone = scene.add
                    .zone(x, y, cardWidth, cardHeight)
                    .setRectangleDropZone(cardWidth, cardHeight);
            } 
            else {
                dropZone = scene.add
                .zone(x, y, cardWidth, cardHeight + 400)
                .setRectangleDropZone(cardWidth, cardHeight + 400);
            
            // Adjust the zone's origin to align top with visual rectangle
            // dropZone.setOrigin(0.5, 1);
            }
            
            dropZone.setData({  zoneObj: zoneObj});
            return dropZone;
        };
        this.renderOutline = (dropZone) => {
            let dropZoneOutline = scene.add.graphics();
            dropZoneOutline.lineStyle(4, 0xffd3af5e);

            let height = dropZone.input.hitArea.height;
            if(!dropZone.data.values.zoneObj.stack) {
                height = dropZone.input.hitArea.height - 400;
            }
            let y = dropZone.y;
            if(!dropZone.data.values.zoneObj.stack) {
                y = dropZone.y - 400 + height + 50;
            }

            return dropZoneOutline.strokeRect(dropZone.x - dropZone.input.hitArea.width / 2, y - height  / 2, dropZone.input.hitArea.width, height);
        }
    }
}