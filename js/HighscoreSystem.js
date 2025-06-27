export class HighscoreSystem {
  constructor() {
    this.localBest = this.getLocalBest();
    // TODO: Initialize Firebase here if needed
  }

  getLocalBest() {
    return Number(localStorage.getItem("personalBest") || 0);
  }

  setLocalBest(score) {
    if (score > this.localBest) {
      this.localBest = score;
      localStorage.setItem("personalBest", score);
    }
  }

  submitToFirebase(score, playerName) {
    // TODO: Firebase submission logic
  }

  fetchGlobalHighscores() {
    // TODO: Firebase fetch logic
  }
}
