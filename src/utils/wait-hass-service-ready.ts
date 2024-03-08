const COMPONENTS_TO_WAIT = {
  entities: '_ent',
  config: '_cnf',
  services: '_srv',
  panels: '_pnl',
  themes: '_thm',
  user: '_usr',
  frontend: '_frontendUserData-core',
};

export async function waitHassServiceReady(): Promise<void> {
  const { conn } = await window.hassConnection;
  await Promise.all(Object.values(COMPONENTS_TO_WAIT).map(key => new Promise((resolve: any) => conn[key]['subscribe'](resolve))));
}
