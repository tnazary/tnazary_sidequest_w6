// src/SoundManager.js
// Audio playback (SYSTEM layer).
//
// Responsibilities:
// - Load sound assets during preload() (via loadSound)
// - Play sounds by key (SFX/music)
// - Provide a simple abstraction so gameplay code never touches audio directly
//
// Non-goals:
// - Does NOT subscribe to EventBus directly (Game wires events → play())
// - Does NOT decide when events happen (WORLD logic emits events)
// - Does NOT manage UI
//
// Architectural notes:
// - Game connects EventBus events (leaf:collected, player:damaged, etc.) to SoundManager.play().
// - This keeps audio concerns isolated from gameplay and supports easy swapping/muting.

export class SoundManager {
  constructor() {
    this.sfx = {};
    this.backgroundMusic = null;
  }

  load(name, path) {
    // loadSound can throw (e.g. if p5.sound isn't loaded, audio is blocked, or the file is missing).
    // We keep the game running even when audio fails.
    try {
      if (typeof loadSound !== "function") {
        console.warn(
          "SoundManager: loadSound() is not available (p5.sound missing)",
        );
        return;
      }
      const sound = loadSound(path);
      this.sfx[name] = sound;
      if (name === "music") {
        this.backgroundMusic = sound;
      }
    } catch (err) {
      console.warn(
        `SoundManager: failed to load '${name}' from '${path}':`,
        err,
      );
      this.sfx[name] = null;
    }
  }

  play(name, opts = {}) {
    const sound = this.sfx[name];
    if (!sound) return;

    try {
      if (opts.loop && typeof sound.loop === "function") {
        sound.loop();
        return;
      }
      sound.play();
    } catch (err) {
      console.warn(`SoundManager: failed to play '${name}':`, err);
    }
  }

  startBackgroundMusic() {
    if (!this.backgroundMusic) return;
    try {
      if (typeof this.backgroundMusic.loop === "function") {
        this.backgroundMusic.loop();
      } else {
        this.backgroundMusic.play();
      }
    } catch (err) {
      console.warn("SoundManager: failed to start background music:", err);
    }
  }
}
