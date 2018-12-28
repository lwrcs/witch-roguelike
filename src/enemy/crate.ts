import { Enemy } from "./enemy";
import { Level } from "../level";
import { Game } from "../game";
import { Heart } from "../item/heart";
import { LevelConstants } from "../levelConstants";
import { GenericParticle } from "../particle/genericParticle";

export class Crate extends Enemy {
  constructor(level: Level, game: Game, x: number, y: number) {
    super(level, game, x, y);
    this.level = level;
    this.health = 1;
    this.maxHealth = 1;
    this.tileX = 0;
    this.tileY = 0;
    this.hasShadow = false;
    this.pushable = true;
  }

  kill = () => {
    this.dead = true;

    GenericParticle.spawnCluster(this.level, this.x + 0.5, this.y + 0.5, "#d9a066");
  };
  killNoBones = () => {
    this.kill();
  };

  draw = () => {
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
        "black", this.shadeAmount()
      );
    }
  };

  drawTopLayer = () => {};
}
