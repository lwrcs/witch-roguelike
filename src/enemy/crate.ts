import { Enemy } from "./enemy";
import { Level } from "../level";
import { Game } from "../game";
import { HealthBar } from "../healthbar";

export class Crate extends Enemy {
  constructor(level: Level, game: Game, x: number, y: number) {
    super(level, game, x, y);
    this.level = level;
    this.healthBar = new HealthBar(8);
    this.tileX = 13;
    this.tileY = 0;
    this.hasShadow = false;
  }

  kill = () => {
    this.dead = true;
  };
}
