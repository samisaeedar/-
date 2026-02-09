
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  setDoc
} from "firebase/firestore";
import { Note } from './types';

// ملاحظة: في بيئة الإنتاج الحقيقية، يتم وضع هذه القيم في متغيرات بيئة
// لكن للتسهيل سأضع البنية الأساسية التي تتصل بـ Firebase
const firebaseConfig = {
  apiKey: process.env.API_KEY, // نستخدم نفس المفتاح للتسهيل أو مفتاح Firebase الخاص بك
  authDomain: "smart-notes-ai.firebaseapp.com",
  projectId: "smart-notes-ai",
  storageBucket: "smart-notes-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef12345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const notesCollection = collection(db, "notes");

export const dbService = {
  // استماع للتغييرات بشكل حي (Real-time)
  subscribeToNotes(callback: (notes: Note[]) => void) {
    const q = query(notesCollection, orderBy("created_at", "desc"));
    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      callback(notes);
    });
  },

  async save(note: Note): Promise<void> {
    // نستخدم setDoc مع ID مخصص أو addDoc لـ ID تلقائي
    const noteRef = doc(db, "notes", note.id);
    await setDoc(noteRef, {
      content: note.content,
      ai_title: note.ai_title,
      ai_category: note.ai_category,
      created_at: note.created_at
    });
  },

  async delete(id: string): Promise<void> {
    const noteRef = doc(db, "notes", id);
    await deleteDoc(noteRef);
  },

  async getAll(): Promise<Note[]> {
    const q = query(notesCollection, orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Note[];
  }
};
