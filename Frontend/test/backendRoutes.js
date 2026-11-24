
import { readFileSync } from 'node:fs';
import path from 'node:path';

const APP_DIR = path.resolve(
  process.cwd(),
  '../Backend/src/main/java/app'
);

const join = (...parts) => '/' + parts.join('/').split('/').filter(Boolean).join('/');

// Reads Routing.java and every controller it mounts, and returns the routes as
// Javalin registers them, e.g. { method: 'POST', path: '/api/users/auth/register' }.
export function readBackendRoutes() {
  const routing = readFileSync(path.join(APP_DIR, 'server/Routing.java'), 'utf8');
  const prefix = routing.match(/path\(\s*"([^"]*)"/)?.[1] ?? '';
  const controllers = [...routing.matchAll(/(\w+Controller)\.registerRoutes\(\)/g)].map((m) => m[1]);

  return controllers.flatMap((name) => {
    const source = readFileSync(path.join(APP_DIR, 'controllers', `${name}.java`), 'utf8');

    return [...source.matchAll(/\b(get|post|put|patch|delete)\(\s*"([^"]+)"/g)].map(([, method, route]) => ({
      method: method.toUpperCase(),
      path: join(prefix, route)
    }));
  });
}

// '/api/restaurant/{id}' matches '/api/restaurant/42'
export function matchesRoute(route, method, pathname) {
  const pattern = new RegExp('^' + route.path.replace(/\{[^/]+\}/g, '[^/]+') + '$');
  return route.method === method && pattern.test(pathname);
}
