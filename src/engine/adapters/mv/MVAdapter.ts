import { GameEngineAdapter, EngineId, Game, EngineCapabilities } from '../../../types';

export class MVAdapter implements GameEngineAdapter {
  id: EngineId = 'mv';
  name = 'RPG Maker MV';
  version = '1.6.2'; // approx
  capabilities: EngineCapabilities = {
    html5: true,
    native: false,
    touchInput: true,
    keyboardInput: true,
    saveStates: false,
  };

  private iframe: HTMLIFrameElement | null = null;

  detect(files: string[]): number {
    const hasCore = files.some(p => p.includes('js/rpg_core.js'));
    const hasIndex = files.some(p => p.includes('index.html'));
    return (hasCore && hasIndex) ? 100 : 0;
  }

  async launch(game: Game, container: HTMLElement): Promise<void> {
    this.iframe = document.createElement('iframe');
    this.iframe.style.width = '100%';
    this.iframe.style.height = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.background = 'black';
    
    // The virtual filesystem handles serving via service worker
    // Format: /game-fs/<gameId>/<rootFolder>index.html
    const rootFolder = game.path || '';
    this.iframe.src = `/game-fs/${encodeURIComponent(game.id)}/${rootFolder}index.html`;

    container.appendChild(this.iframe);
  }

  async stop(game: Game): Promise<void> {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
    this.iframe = null;
  }

  async pause(game: Game): Promise<void> {
    // Basic pause could be sending a message to the iframe or hiding it
  }

  async resume(game: Game): Promise<void> {
    // Resume
  }
}
