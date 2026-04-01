export const WORLD_W = 1600;
export const WORLD_H = 1200;
export const VIEW_W = 640;
export const VIEW_H = 480;

const LERP = 0.08;

export function updateCamera(camera, player) {
  const targetX = player.x + player.width / 2 - VIEW_W / 2;
  const targetY = player.y + player.height / 2 - VIEW_H / 2;

  camera.x += (targetX - camera.x) * LERP;
  camera.y += (targetY - camera.y) * LERP;

  camera.x = Math.max(0, Math.min(WORLD_W - VIEW_W, camera.x));
  camera.y = Math.max(0, Math.min(WORLD_H - VIEW_H, camera.y));
}

export function screenToWorld(sx, sy, camera) {
  return { x: sx + camera.x, y: sy + camera.y };
}

export function worldToScreen(wx, wy, camera) {
  return { x: wx - camera.x, y: wy - camera.y };
}
