import { Enemy, EnemyDirection } from "./enemy";
import { Game } from "../game";
import { Level } from "../level";
import { Player } from "../player";
import { HitWarning } from "../hitWarning";
import { GenericParticle } from "../particle/genericParticle";
import { Coin } from "../item/coin";
import { RedGem } from "../item/redgem";
import { Item } from "../item/item";
import { Spear } from "../weapon/spear";
import { DualDagger } from "../weapon/dualdagger";
import { GreenGem } from "../item/greengem";
import { Random } from "../random";
import { astar } from "../astarclass";
import { SpikeTrap } from "../tile/spiketrap";
import { Pickaxe } from "../weapon/pickaxe";

export class ZombieEnemy extends Enemy {
  frame: number;
  ticks: number;
  seenPlayer: boolean;
  aggro: boolean;
  targetPlayer: Player;
  drop: Item;

  constructor(level: Level, game: Game, x: number, y: number, rand: () => number, drop?: Item) {
    super(level, game, x, y);
    this.ticks = 0;
    this.frame = 0;
    this.health = 1;
    this.maxHealth = 1;
    this.tileX = 17;
    this.tileY = 8;
    this.seenPlayer = false;
    this.aggro = false;
    this.deathParticleColor = "#ffffff";

    if (drop) this.drop = drop;
    else {
      let dropProb = Random.rand();
      if (dropProb < 0.025) this.drop = new Pickaxe(this.level, 0, 0);
      else if (dropProb < 0.02) this.drop = new GreenGem(this.level, 0, 0);
      else this.drop = new Coin(this.level, 0, 0);
    }
  }

  hit = (): number => {
    return 1;
  };

  hurt = (playerHitBy: Player, damage: number) => {
    if (playerHitBy) {
      this.aggro = true;
      this.targetPlayer = playerHitBy;
      this.facePlayer(playerHitBy);
      if (playerHitBy === this.game.players[this.game.localPlayerID]) this.alertTicks = 2; // this is really 1 tick, it will be decremented immediately in tick()
    }
    this.health -= damage;
    this.healthBar.hurt();
    if (this.health <= 0) {
      this.kill();
    } else {
      GenericParticle.spawnCluster(this.level, this.x + 0.5, this.y + 0.5, this.deathParticleColor);
    }
  };

  tick = () => {
    this.lastX = this.x;
    this.lastY = this.y;
    if (!this.dead) {
      if (this.skipNextTurns > 0) {
        this.skipNextTurns--;
        return;
      }
      this.ticks++;
      if (!this.seenPlayer) {
        let p = this.nearestPlayer();
        if (p !== false) {
          let [distance, player] = p;
          if (distance <= 4) {
            this.targetPlayer = player;
            this.facePlayer(player);
            this.seenPlayer = true;
            if (player === this.game.players[this.game.localPlayerID]) this.alertTicks = 1;
            /*this.level.hitwarnings.push(new HitWarning(this.game, this.x - 1, this.y));
            this.level.hitwarnings.push(new HitWarning(this.game, this.x + 1, this.y));
            this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y - 1));
            this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y + 1));*/
          }
        }
      }
      else if (this.seenPlayer) {
        if (this.level.playerTicked === this.targetPlayer) {
          this.alertTicks = Math.max(0, this.alertTicks - 1);
          let oldX = this.x;
          let oldY = this.y;

          let disablePositions = Array<astar.Position>();
          for (const e of this.level.enemies) {
            if (e !== this) {
              disablePositions.push({ x: e.x, y: e.y } as astar.Position);
            }
          }
          for (let xx = this.x - 1; xx <= this.x + 1; xx++) {
            for (let yy = this.y - 1; yy <= this.y + 1; yy++) {
              if (
                this.level.levelArray[xx][yy] instanceof SpikeTrap &&
                (this.level.levelArray[xx][yy] as SpikeTrap).on
              ) {
                // don't walk on active spiketraps
                disablePositions.push({ x: xx, y: yy } as astar.Position);
              }
            }
          }

          let grid = [];
          for (let x = 0; x < this.level.roomX + this.level.width; x++) {
            grid[x] = [];
            for (let y = 0; y < this.level.roomY + this.level.height; y++) {
              if (this.level.levelArray[x] && this.level.levelArray[x][y])
                grid[x][y] = this.level.levelArray[x][y];
              else
                grid[x][y] = false;
            }
          }
          let moves = astar.AStar.search(
            grid,
            this,
            this.targetPlayer,
            disablePositions,
            false,
            false,
            true,
            this.direction
          );
          if (moves.length > 0) {
            let moveX = moves[0].pos.x;
            let moveY = moves[0].pos.y;
            let oldDir = this.direction;
            let player = this.targetPlayer;
            this.facePlayer(player);
            if (moveX > oldX) this.direction = EnemyDirection.RIGHT;
            else if (moveX < oldX) this.direction = EnemyDirection.LEFT;
            else if (moveY > oldY) this.direction = EnemyDirection.DOWN;
            else if (moveY < oldY) this.direction = EnemyDirection.UP;
            if (oldDir == this.direction) {
              let hitPlayer = false;
              for (const i in this.game.players) {
                if (this.game.levels[this.game.players[i].levelID] === this.level && this.game.players[i].x === moveX && this.game.players[i].y === moveY) {
                  this.game.players[i].hurt(this.hit(), "zombie");
                  this.drawX = 0.5 * (this.x - this.game.players[i].x);
                  this.drawY = 0.5 * (this.y - this.game.players[i].y);
                  if (this.game.players[i] === this.game.players[this.game.localPlayerID])
                    this.game.shakeScreen(10 * this.drawX, 10 * this.drawY);
                }
              }
              if (!hitPlayer) {
                this.tryMove(moveX, moveY);
                this.drawX = this.x - oldX;
                this.drawY = this.y - oldY;
                if (this.x > oldX) this.direction = EnemyDirection.RIGHT;
                else if (this.x < oldX) this.direction = EnemyDirection.LEFT;
                else if (this.y > oldY) this.direction = EnemyDirection.DOWN;
                else if (this.y < oldY) this.direction = EnemyDirection.UP;
              }
            }
          }

          if (this.direction == EnemyDirection.LEFT) {
            this.level.hitwarnings.push(new HitWarning(this.game, this.x - 1, this.y));
            disablePositions.push({ x: this.x, y: this.y + 1 } as astar.Position);
            disablePositions.push({ x: this.x, y: this.y - 1 } as astar.Position);
          }
          if (this.direction == EnemyDirection.RIGHT) {
            this.level.hitwarnings.push(new HitWarning(this.game, this.x + 1, this.y));
            disablePositions.push({ x: this.x, y: this.y + 1 } as astar.Position);
            disablePositions.push({ x: this.x, y: this.y - 1 } as astar.Position);
          }
          if (this.direction == EnemyDirection.DOWN) {
            this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y + 1));
            disablePositions.push({ x: this.x + 1, y: this.y } as astar.Position);
            disablePositions.push({ x: this.x - 1, y: this.y } as astar.Position);
          }
          if (this.direction == EnemyDirection.UP) {
            this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y - 1));
            disablePositions.push({ x: this.x + 1, y: this.y } as astar.Position);
            disablePositions.push({ x: this.x - 1, y: this.y } as astar.Position);
          }
        }

        let targetPlayerOffline = Object.values(this.game.offlinePlayers).indexOf(this.targetPlayer) !== -1;
        if (!this.aggro || targetPlayerOffline) {
          let p = this.nearestPlayer();
          if (p !== false) {
            let [distance, player] = p;
            if (distance <= 4 && (targetPlayerOffline || distance < this.playerDistance(this.targetPlayer))) {
              if (player !== this.targetPlayer) {
                this.targetPlayer = player;
                this.facePlayer(player);
                if (player === this.game.players[this.game.localPlayerID]) this.alertTicks = 1;
                if (this.direction == EnemyDirection.LEFT) {
                  this.level.hitwarnings.push(new HitWarning(this.game, this.x - 1, this.y));
                }
                if (this.direction == EnemyDirection.RIGHT) {
                  this.level.hitwarnings.push(new HitWarning(this.game, this.x + 1, this.y));
                }
                if (this.direction == EnemyDirection.DOWN) {
                  this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y + 1));
                }
                if (this.direction == EnemyDirection.UP) {
                  this.level.hitwarnings.push(new HitWarning(this.game, this.x, this.y - 1));
                }
              }
            }
          }
        }
      }
    }
  };

  draw = (delta: number) => {
    if (!this.dead) {
      this.frame += 0.1 * delta;
      if (this.frame >= 4) this.frame = 0;

      if (this.hasShadow)
        Game.drawMob(
          0,
          0,
          1,
          1,
          this.x - this.drawX,
          this.y - this.drawY,
          1,
          1,
          this.level.shadeColor,
          this.shadeAmount()
        );
      Game.drawMob(
        this.tileX + Math.floor(this.frame),
        this.tileY + this.direction * 2,
        1,
        2,
        this.x - this.drawX,
        this.y - 1.5 - this.drawY,
        1,
        2,
        this.level.shadeColor,
        this.shadeAmount()
      );
    }
    if (!this.seenPlayer) {
      this.drawSleepingZs(delta);
    }
    if (this.alertTicks > 0) {
      this.drawExclamation(delta);
    }
  };

}
