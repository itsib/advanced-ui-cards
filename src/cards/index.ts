import { getHassioFeatures } from '../utils/get-hassio-features';

export * from './area-card/area-card';

(async () => {
  const features = await getHassioFeatures();
  if (!features) {
    return;
  }

  await import('./admin');
})();
