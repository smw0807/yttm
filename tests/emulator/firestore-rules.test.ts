import { readFileSync } from 'node:fs';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { projectId, requireEmulator } from './safety';

let env: RulesTestEnvironment;

it.each(['owner', 'intruder', null])(
  'denies direct onboarding metric access for %s',
  async (uid) => {
    const context = uid ? env.authenticatedContext(uid) : env.unauthenticatedContext();
    const ref = doc(context.firestore(), '_onboardingMetrics/test');
    await assertFails(getDoc(ref));
    await assertFails(setDoc(ref, { enabled: true, step: 3 }));
    await assertFails(deleteDoc(ref));
  },
);
beforeAll(async () => {
  requireEmulator();
  env = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port: 8085, rules: readFileSync('firestore.rules', 'utf8') },
  });
});
afterAll(async () => {
  await env?.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users/owner'), { uid: 'owner', displayName: 'Owner' }),
      setDoc(doc(db, 'videos/private'), { userId: 'owner', shareToken: null, title: 'Private' }),
      setDoc(doc(db, 'videos/shared'), {
        userId: 'owner',
        shareToken: 'share-token',
        title: 'Shared',
      }),
      setDoc(doc(db, 'videos/private/memos/memo'), { content: 'private memo', timestampSec: 3 }),
      setDoc(doc(db, 'videos/shared/memos/memo'), { content: 'shared memo', timestampSec: 3 }),
      setDoc(doc(db, 'collections/owned'), {
        userId: 'owner',
        name: 'Collection',
        videoIds: ['private'],
      }),
      setDoc(doc(db, '_rateLimits/counter'), { count: 1, resetAt: 1000 }),
    ]);
  });
});

describe.each(['videos', 'collections'])('%s ownership', (name) => {
  const path = `${name}/${name === 'videos' ? 'private' : 'owned'}`;
  it('allows owner CRUD', async () => {
    const db = env.authenticatedContext('owner').firestore();
    await assertSucceeds(getDoc(doc(db, path)));
    await assertSucceeds(updateDoc(doc(db, path), { title: 'Updated' }));
    await assertSucceeds(setDoc(doc(db, `${name}/new`), { userId: 'owner' }));
    await assertSucceeds(deleteDoc(doc(db, path)));
  });
  it('denies another user all CRUD operations', async () => {
    const db = env.authenticatedContext('intruder').firestore();
    await assertFails(getDoc(doc(db, path)));
    await assertFails(updateDoc(doc(db, path), { title: 'Changed' }));
    await assertFails(deleteDoc(doc(db, path)));
    await assertFails(setDoc(doc(db, `${name}/forged`), { userId: 'owner' }));
  });
  it('denies owner transfer through updates and full overwrites', async () => {
    const db = env.authenticatedContext('owner').firestore();
    await assertFails(updateDoc(doc(db, path), { userId: 'intruder' }));
    await assertFails(setDoc(doc(db, path), { userId: 'intruder' }));
  });
  it('allows only ownership-filtered list queries', async () => {
    const db = env.authenticatedContext('owner').firestore();
    const own = await assertSucceeds(
      getDocs(query(collection(db, name), where('userId', '==', 'owner'))),
    );
    expect(own.empty).toBe(false);
    await assertFails(getDocs(collection(db, name)));
    const foreignDb = env.authenticatedContext('intruder').firestore();
    await assertFails(getDocs(query(collection(foreignDb, name), where('userId', '==', 'owner'))));
    const emptyOwn = await assertSucceeds(
      getDocs(query(collection(foreignDb, name), where('userId', '==', 'intruder'))),
    );
    expect(emptyOwn.empty).toBe(true);
  });
  it('rejects an entire batch containing a foreign write', async () => {
    const db = env.authenticatedContext('intruder').firestore();
    const ownRef = doc(db, `${name}/batch-own`);
    const batch = writeBatch(db);
    batch.set(ownRef, { userId: 'intruder', title: 'Should not persist' });
    batch.update(doc(db, path), { title: 'Foreign write' });
    await assertFails(batch.commit());
    await env.withSecurityRulesDisabled(async (context) => {
      expect((await getDoc(doc(context.firestore(), `${name}/batch-own`))).exists()).toBe(false);
      expect((await getDoc(doc(context.firestore(), path))).data()?.userId).toBe('owner');
    });
  });
});

describe.each(['google.com', 'anonymous'] as const)('%s memo isolation', (provider) => {
  it.each(['private', 'shared'])('restricts %s memo lists and writes to the owner', async (id) => {
    const claims = { firebase: { sign_in_provider: provider } };
    const ownerDb = env.authenticatedContext('owner', claims).firestore();
    const foreignDb = env.authenticatedContext('intruder', claims).firestore();
    const path = `videos/${id}/memos`;
    const own = await assertSucceeds(getDocs(collection(ownerDb, path)));
    expect(own.docs.map((memo) => memo.id)).toEqual(['memo']);
    await assertFails(getDocs(collection(foreignDb, path)));
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), path)));
    await assertFails(setDoc(doc(foreignDb, `${path}/new`), { content: 'Foreign memo' }));
    await assertFails(updateDoc(doc(foreignDb, `${path}/memo`), { content: 'Foreign edit' }));
    await assertFails(deleteDoc(doc(foreignDb, `${path}/memo`)));
  });
});

it('denies access to surviving memos after the parent video is deleted', async () => {
  const db = env.authenticatedContext('owner').firestore();
  await assertSucceeds(deleteDoc(doc(db, 'videos/private')));
  await assertFails(getDoc(doc(db, 'videos/private/memos/memo')));
  await assertFails(getDocs(collection(db, 'videos/private/memos')));
  await assertFails(updateDoc(doc(db, 'videos/private/memos/memo'), { content: 'Orphan edit' }));
});

it('denies another account profile reads, listing, updates and deletion', async () => {
  const db = env.authenticatedContext('intruder').firestore();
  const profile = doc(db, 'users/owner');
  await assertFails(getDoc(profile));
  await assertFails(getDocs(collection(db, 'users')));
  await assertFails(updateDoc(profile, { displayName: 'Impersonated' }));
  await assertFails(deleteDoc(profile));
});

it.each([
  'videos/private',
  'videos/shared',
  'videos/shared/memos/memo',
  'videos/private/memos/memo',
  'collections/owned',
  'users/owner',
])('blocks unauthenticated reads and writes to %s', async (path) => {
  const db = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, path)));
  await assertFails(setDoc(doc(db, path), { userId: 'owner' }));
  await assertFails(deleteDoc(doc(db, path)));
});
it('does not expose shared videos or memos directly to other accounts', async () => {
  const db = env.authenticatedContext('intruder').firestore();
  await assertFails(getDoc(doc(db, 'videos/shared')));
  await assertFails(getDoc(doc(db, 'videos/shared/memos/memo')));
  await assertFails(
    getDocs(query(collection(db, 'videos'), where('shareToken', '==', 'share-token'))),
  );
});
it('permits guest ownership and memo CRUD', async () => {
  const db = env
    .authenticatedContext('guest', { firebase: { sign_in_provider: 'anonymous' } })
    .firestore();
  await assertSucceeds(
    setDoc(doc(db, 'videos/guest-video'), { userId: 'guest', shareToken: null }),
  );
  const memo = doc(db, 'videos/guest-video/memos/new');
  await assertSucceeds(setDoc(memo, { content: 'Memo', timestampSec: 1 }));
  await assertSucceeds(getDoc(memo));
  await assertSucceeds(updateDoc(memo, { content: 'Edit' }));
  await assertSucceeds(deleteDoc(memo));
});
it('rejects foreign and orphan memo writes', async () => {
  const db = env.authenticatedContext('intruder').firestore();
  await assertFails(setDoc(doc(db, 'videos/private/memos/new'), { content: 'No' }));
  await assertFails(updateDoc(doc(db, 'videos/private/memos/memo'), { content: 'No' }));
  await assertFails(deleteDoc(doc(db, 'videos/private/memos/memo')));
  await assertFails(setDoc(doc(db, 'videos/missing/memos/new'), { content: 'No' }));
});
it('protects profile UID and allows the owner to edit their profile', async () => {
  const db = env.authenticatedContext('owner').firestore();
  await assertSucceeds(updateDoc(doc(db, 'users/owner'), { displayName: 'New name' }));
  await assertFails(updateDoc(doc(db, 'users/owner'), { uid: 'intruder' }));
  await assertFails(setDoc(doc(db, 'users/another'), { uid: 'another' }));
  const fresh = env.authenticatedContext('fresh').firestore();
  await assertFails(setDoc(doc(fresh, 'users/fresh'), { uid: 'owner' }));
  await assertSucceeds(setDoc(doc(fresh, 'users/fresh'), { uid: 'fresh' }));
});
it('denies every client access to server counters and unknown collections', async () => {
  for (const db of [
    env.unauthenticatedContext().firestore(),
    env.authenticatedContext('owner').firestore(),
  ]) {
    await assertFails(getDoc(doc(db, '_rateLimits/counter')));
    await assertFails(setDoc(doc(db, '_rateLimits/counter'), { count: 0 }));
    await assertFails(deleteDoc(doc(db, '_rateLimits/counter')));
    await assertFails(setDoc(doc(db, 'unknown/document'), { value: 'no' }));
  }
});
