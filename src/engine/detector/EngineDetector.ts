import { EngineId } from '../../types';

export function detectEngineFromPaths(paths: string[]): { engine: EngineId, version?: string, rootFolder: string, confidence: number } {
  let mvScore = 0;
  let mzScore = 0;
  let xpScore = 0;
  let vxScore = 0;
  let vxAceScore = 0;

  let probableRoot = '';

  for (const path of paths) {
    const lowerPath = path.toLowerCase();
    
    if (lowerPath.endsWith('index.html')) {
      const root = path.substring(0, path.length - 'index.html'.length);
      const lowerRoot = root.toLowerCase();
      
      const hasRpgCore = paths.some(p => p.toLowerCase() === lowerRoot + 'js/rpg_core.js');
      const hasRmmzCore = paths.some(p => p.toLowerCase() === lowerRoot + 'js/rmmz_core.js');
      const hasGameRmmzProject = paths.some(p => p.toLowerCase() === lowerRoot + 'game.rmmzproject');
      const hasGameRpgProject = paths.some(p => p.toLowerCase() === lowerRoot + 'game.rpgproject');

      let currentMv = 0;
      let currentMz = 0;

      if (hasRpgCore) currentMv += 50;
      if (hasGameRpgProject) currentMv += 30;
      if (paths.some(p => p.toLowerCase().startsWith(lowerRoot + 'www/'))) currentMv += 20;

      if (hasRmmzCore) currentMz += 50;
      if (hasGameRmmzProject) currentMz += 30;

      if (currentMv > mvScore) {
        mvScore = currentMv;
        if (mvScore > mzScore) probableRoot = root;
      }
      if (currentMz > mzScore) {
        mzScore = currentMz;
        if (mzScore > mvScore) probableRoot = root;
      }
    } else if (lowerPath.endsWith('game.exe')) {
      const root = path.substring(0, path.length - 'game.exe'.length);
      const lowerRoot = root.toLowerCase();
      
      const hasRgss1 = paths.some(p => p.toLowerCase().startsWith(lowerRoot + 'data/') && p.toLowerCase().endsWith('.rxdata'));
      const hasRgss2 = paths.some(p => p.toLowerCase().startsWith(lowerRoot + 'data/') && p.toLowerCase().endsWith('.rvdata'));
      const hasRgss3 = paths.some(p => p.toLowerCase().startsWith(lowerRoot + 'data/') && p.toLowerCase().endsWith('.rvdata2'));

      if (hasRgss1) { xpScore += 80; probableRoot = root; }
      if (hasRgss2) { vxScore += 80; probableRoot = root; }
      if (hasRgss3) { vxAceScore += 80; probableRoot = root; }
    }
  }

  const scores = [
    { engine: 'mv' as EngineId, score: mvScore },
    { engine: 'mz' as EngineId, score: mzScore },
    { engine: 'xp' as EngineId, score: xpScore },
    { engine: 'vx' as EngineId, score: vxScore },
    { engine: 'vxace' as EngineId, score: vxAceScore },
  ].sort((a, b) => b.score - a.score);

  const top = scores[0];

  if (top.score > 0) {
    return {
      engine: top.engine,
      rootFolder: probableRoot,
      confidence: Math.min(top.score, 100)
    };
  }

  return { engine: 'unknown', rootFolder: '', confidence: 0 };
}
