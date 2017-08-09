import { Collidable } from "../tile/collidable";
import { Game } from "../game";
import { Level } from "../level";
import { HealthBar } from "../healthbar";
import { Bones } from "../tile/bones";

export class Enemy extends Collidable {
  drawX: number;
  drawY: number;
  dead: boolean;
  game: Game;
  healthBar: HealthBar;
  tileX: number;
  tileY: number;
  hasShadow: boolean;

  constructor(level: Level, game: Game, x: number, y: number) {
    super(level, x, y);
    this.game = game;
    this.drawX = 0;
    this.drawY = 0;
    this.healthBar = new HealthBar(1);
    this.tileX = 0;
    this.tileY = 0;
    this.hasShadow = true;
  }

  tryMove = (x: number, y: number) => {
    for (const e of this.level.enemies) {
      if (e !== this && e.x === x && e.y === y) {
        return;
      }
    }
    if (this.game.level.getCollidable(x, y) === null) {
      this.x = x;
      this.y = y;
    }
  };

  hit = (): number => {
    return 0;
  };

  hurt = (damage: number) => {
    this.healthBar.hurt(damage);
    if (this.healthBar.health <= 0) {
      this.kill();
    }
  };

  kill = () => {
    this.level.levelArray[this.x][this.y] = new Bones(this.level, this.x, this.y);
    this.dead = true;
  };

  draw = () => {
    if (!this.dead) {
      this.drawX += -0.5 * this.drawX;
      this.drawY += -0.5 * this.drawY;
      if (this.hasShadow) Game.drawMob(0, 0, 1, 1, this.x - this.drawX, this.y - this.drawY, 1, 1);
      Game.drawMob(
        this.tileX,
        this.tileY,
        1,
        2,
        this.x - this.drawX,
        this.y - 1.5 - this.drawY,
        1,
        2
      );
    }
  };
  tick = () => {};
  drawTopLayer = () => {
    this.healthBar.drawAboveTile(this.x - this.drawX + 0.5, this.y - 0.75 - this.drawY);
  };
}
