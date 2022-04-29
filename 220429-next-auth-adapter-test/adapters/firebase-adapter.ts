import { addDoc, collection, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDoc, getDocs, limit, query, setDoc, where } from "firebase/firestore";
import { Adapter, AdapterSession, AdapterUser } from "next-auth/adapters";
import { findOne } from "./utils";
import { Account } from "next-auth";

export default function FirebaesAdapter(
  db: Firestore,
  options = {
    userCollectionName: '_next_firebase_user_',
    accountCollectionName: '_next_firebase_account_',
    sessionCollectionName: '_next_firebase_session_',

  },
): Adapter {
  const { userCollectionName, accountCollectionName, sessionCollectionName } = options;
  
  const userCollectionRef = collection(db, userCollectionName);
  const accountCollectionRef = collection(db, accountCollectionName);
  const sessionCollectionRef = collection(db, sessionCollectionName);

  return {
    async createUser(data) {
      const userData = {
        name: data.name ?? null,
        email: data.email ?? null,
        image: data.image ?? null,
        emailVerified: data.emailVerified ?? null,
      };
      const userRef = await addDoc(userCollectionRef, userData);
      return {
        id: userRef.id,
        ...userData,
      } as AdapterUser;
    },
    async getUser(id) {
      const userSnap = await getDoc(doc(db, userCollectionName, id));
      if (userSnap.exists()) return userSnap.data() as AdapterUser;
      return null;
    },
    async getUserByEmail(email) {
      const q = query(userCollectionRef, where('email', '==', email), limit(1));
      const userRef = await findOne(q);

      if (!userRef) return null;
      return {
        id: userRef.id,
        ...userRef.data(),
      } as AdapterUser;
    },
    async getUserByAccount({provider, providerAccountId}) {
      const q = query(accountCollectionRef, where('provider', '==', provider), where('providerAccountId', '==', providerAccountId), limit(1));
      const accountRef = await findOne(q);
      if (!accountRef) return null;
      return {
        id: accountRef.id,
        ...accountRef.data(),
      } as AdapterUser;
    },
    async updateUser(data) {
      const { id, ...userData } = data;
      await setDoc(doc(db, userCollectionName, id as string), userData);

      return data as AdapterUser;
    },
    async deleteUser(id) {
      const q = query(userCollectionRef, where('id', '==', id), limit(1));
      const userRef = await findOne(q);
      if (!userRef) return;
      await deleteDoc(doc(db, userCollectionName, userRef.id));
    },
    linkAccount: async (data) => {
      const accountData = {
        userId: data.userId ?? null,
        provider: data.provider ?? null,
        type: data.type ?? null,
        providerAccountId: data.providerAccountId ?? null,
        refreshToken: data.refreshToken ?? null,
        accessToken: data.accessToken ?? null,
        accessTokenExpires: data.accessTokenExpires ?? null,
      };

      const accountRef = await addDoc(accountCollectionRef, accountData);

      return {
        id: accountRef.id,
        ...accountData,
      } as Account;
    },
    async unlinkAccount({ provider, providerAccountId }) {
      const q = query(accountCollectionRef, where('provider', '==', provider), where('providerAccountId', '==', providerAccountId), limit(1));
      const accountRef = await findOne(q);
      if (!accountRef) return;
      await deleteDoc(doc(db, accountCollectionName, accountRef.id));
    },
    async getSessionAndUser(sessionToken) {
      let q;
      q = query(sessionCollectionRef, where('sessionToken', '==', sessionToken), limit(1));
      const sessionRef = await findOne(q);
      if (!sessionRef) return null;
      const session: Partial<AdapterSession> = sessionRef.data();
      q = query(userCollectionRef, where('email', '==', session.userId), limit(1));
      const userRef = await findOne(q);
      if (!userRef) return null
      return {
        user: {
          id: userRef.id,
          ...userRef.data(),
        } as AdapterUser,
        session: {
          id: sessionRef.id,
          ...session,
        } as AdapterSession,
      }
    },
    async createSession(data) {
      const sessionData = {
        sessionToken: data.sessionToken ?? null,
        userId: data.userId ?? null,
        expires: data.expires ?? null,
      };
      const sessionRef = await addDoc(sessionCollectionRef, sessionData);
      return {
        id: sessionRef.id,
        ...sessionData,
      } as AdapterSession;
    },
    async updateSession(data) {
      const { id, ...sessionData } = data;
      await setDoc(doc(db, sessionCollectionName, id as string), sessionData);

      return data as AdapterSession;
    },
    async deleteSession(sessionToken) {
      const q = query(sessionCollectionRef, where('sessionToken', '==', sessionToken), limit(1));
      const sessionRef = await findOne(q);
      if (!sessionRef) return;
      await deleteDoc(doc(db, sessionCollectionName, sessionRef.id));
    },
    // async createVerificationToken(data) {

    // },
    // async useVerificationToken(identifier_token) {

    // },
  }
}