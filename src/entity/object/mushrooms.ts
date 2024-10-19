import { Entity } from "../entity";
import { Room } from "../../room";
import { Game } from "../../game";
import { Heart } from "../../item/heart";
import { LevelConstants } from "../../levelConstants";
import { GenericParticle } from "../../particle/genericParticle";
import { Shrooms } from "../../item/shrooms";
import { EntityType } from "../entity";
import { ImageParticle } from "../../particle/imageParticle";

export class Mushrooms extends Entity {
  constructor(room: Room, game: Game, x: number, y: number) {
    super(room, game, x, y);
    this.room = room;
    this.health = 1;
    this.tileX = 9;
    this.tileY = 2;
    this.hasShadow = false;
    this.chainPushable = false;
  }

  get name() {
    return "mushrooms";
  }

  get type() {
    return EntityType.PROP;
  }

  kill = () => {
    this.dead = true;

    ImageParticle.spawnCluster(this.room, this.x + 0.5, this.y + 0.5, 0, 30);

    this.room.items.push(new Shrooms(this.room, this.x, this.y));
  };
  killNoBones = () => {
    this.kill();
  };

  draw = (delta: number) => {
    // not inherited because it doesn't have the 0.5 offset
    if (!this.dead) {
      this.drawX += -0.5 * this.drawX;
      this.drawY += -0.5 * this.drawY;
      Game.drawObj(
        this.tileX,
        this.tileY,
        1,
        2,
        this.x - this.drawX,
        this.y - 1 - this.drawY,
        1,
        2,
        this.room.shadeColor,
        this.shadeAmount()
      );
    }
  };

  drawTopLayer = (delta: number) => {
    this.drawableY = this.y;
  };
}
