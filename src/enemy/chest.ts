import { Collidable } from "../tile/collidable";
import { Item } from "../item/item";
import { Game } from "../game";
import { Key } from "../item/key";
import { Level } from "../level";
import { Potion } from "../item/potion";
import { Armor } from "../item/armor";
import { Helmet } from "../item/helmet";
import { HealthBuff } from "../item/healthbuff";
import { Enemy } from "./enemy";
import { HealthBar } from "../healthbar";

export class Chest extends Enemy {
  constructor(level: Level, game: Game, x: number, y: number) {
    super(level, game, x, y);

    this.tileX = 17;
    this.tileY = 0;
    this.healthBar = new HealthBar(1);
  }

  kill = () => {
    this.dead = true;
    // DROP TABLES!

    let drop = Game.randTable([1, 1, 2, 3, 4]);

    switch (drop) {
      case 1:
        this.game.level.items.push(new HealthBuff(this.x, this.y));
        break;
      case 2:
        this.game.level.items.push(new Key(this.x, this.y));
        break;
      case 3:
        this.game.level.items.push(
          new Armor(Game.randTable([25, 50, 50, 50, 50, 50, 50, 75]), this.x, this.y)
        );
        break;
      case 4:
        this.game.level.items.push(
          new Helmet(Game.randTable([20, 30, 30, 30, 30, 30, 45]), this.x, this.y)
        );
        break;
    }
  };

  draw = () => {
    if (!this.dead) {
      Game.drawMob(
        this.tileX,
        this.tileY,
        1,
        2,
        this.x - this.drawX,
        this.y - 1 - this.drawY,
        1,
        2
      );
    }
  };
}
