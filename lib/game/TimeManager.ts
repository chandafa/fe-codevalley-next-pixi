import { useGameStore } from '../store/gameStore';

export class TimeManager {
  private gameStore = useGameStore;
  private timeScale: number = 60; // 1 real second = 1 game minute
  private lastUpdate: number = Date.now();
  private interval: NodeJS.Timeout | null = null;

  constructor() {
    this.startTimeLoop();
  }

  private startTimeLoop() {
    this.interval = setInterval(() => {
      this.updateTime();
    }, 1000); // Update every second
  }

  private updateTime() {
    const currentTime = this.gameStore.getState().gameTime;
    let { gameYear, gameSeason, gameDay, gameHour, gameMinute } = currentTime;

    // Advance time
    gameMinute += 1;

    if (gameMinute >= 60) {
      gameMinute = 0;
      gameHour += 1;

      if (gameHour >= 24) {
        gameHour = 0;
        gameDay += 1;

        // Each season has 28 days
        if (gameDay > 28) {
          gameDay = 1;
          const seasons = ['spring', 'summer', 'fall', 'winter'];
          const currentSeasonIndex = seasons.indexOf(gameSeason);
          const nextSeasonIndex = (currentSeasonIndex + 1) % seasons.length;
          gameSeason = seasons[nextSeasonIndex];

          // New year after winter
          if (gameSeason === 'spring') {
            gameYear += 1;
          }
        }
      }
    }

    const isNight = gameHour >= 20 || gameHour < 6;

    this.gameStore.getState().setGameTime({
      gameYear,
      gameSeason,
      gameDay,
      gameHour,
      gameMinute,
      isNight,
    });
  }

  public destroy() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}