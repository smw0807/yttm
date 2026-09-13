export const projectId = 'yttm-38af5';

export function publicConfig(env, requestedProject) {
  if (requestedProject !== projectId || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== projectId) {
    throw new Error(`Explicit --project ${projectId} and matching public configuration required`);
  }
  const config = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value))
    throw new Error('Missing public Firebase config');
  if (config.authDomain !== `${projectId}.firebaseapp.com`) {
    throw new Error('Unexpected Firebase auth domain');
  }
  return config;
}
