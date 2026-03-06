import re
import os

filepath = r"g:\내 드라이브\_코딩하는 강쌤\smart-board\App.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace("import { db, auth, googleProvider } from './lib/firebase';", "import { supabase } from './lib/supabase';")
content = content.replace("import { saveData, loadData, deleteData } from './lib/db';", "import { saveData, loadData, deleteData } from './lib/db';")

# 2. Auth Listener
content = re.sub(
    r"const unsubscribe = auth\.onAuthStateChanged\(\(user: any\) => \{\n\s+setCurrentUser\(user\);\n\s+setIsAuthReady\(true\);\n\s+setIsLoginLoading\(false\);\s*\}\);\n\s+return \(\) => unsubscribe\(\);",
    """const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setCurrentUser(session?.user || null);
          setIsAuthReady(true);
          setIsLoginLoading(false);
      });
      return () => subscription.unsubscribe();""",
    content
)

# 3. Google Login
content = re.sub(
    r"await auth\.signInWithPopup\(googleProvider\);",
    "await supabase.auth.signInWithOAuth({ provider: 'google' });",
    content
)

# 4. Logout
content = re.sub(
    r"await auth\.signOut\(\);",
    "await supabase.auth.signOut();",
    content
)

# 5. Shared Canvas Load
old_shared = """const docRef = db.collection('sharedCanvases').doc(sharedId);
                    const docSnap = await docRef.get();

                    if (docSnap.exists) {
                        const data = docSnap.data();
                        let finalPackedData = '';
                        
                        if (data.packedData) {
                            finalPackedData = data.packedData;
                        } else if (data.totalChunks) {
                             setStatusMessage({ text: 'Downloading large canvas...', type: 'success' });
                             const chunksSnapshot = await docRef.collection('chunks').orderBy('index').get();
                             chunksSnapshot.forEach((chunkDoc: any) => {
                                 finalPackedData += chunkDoc.data().data;
                             });
                        }"""
new_shared = """const { data, error } = await supabase.from('shared_canvases').select('*').eq('id', sharedId).single();

                    if (!error && data) {
                        let finalPackedData = data.packed_data || '';"""
content = content.replace(old_shared, new_shared)

# 6. Delete collection
old_delete = """const deleteCollection = async (collectionRef: any) => {
    try {
      const snapshot = await collectionRef.get();
      const batch = db.batch();
      snapshot.docs.forEach((doc: any) => {
          batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (e) {
      console.warn("Failed to delete subcollection", e);
    }
  };"""
content = content.replace(old_delete, "")

# 7. Auto-save
old_autosave = """const userSavesRef = db.collection('users').doc(userId).collection('saves');
            const saveDocRef = userSavesRef.doc(fileId);
            
            const compressedBase64 = compressData(currentStateString);
            const CHUNK_SIZE = 800000; 

            // Clean up old chunks before overwriting to prevent corruption
            await deleteCollection(saveDocRef.collection('chunks'));

            const lastModified = Date.now();

            if (compressedBase64.length <= CHUNK_SIZE) {
                    await saveDocRef.set({
                    name: fileName,
                    lastModified,
                    packedData: compressedBase64,
                    totalChunks: 0
                });
            } else {
                const chunks: string[] = [];
                for (let i = 0; i < compressedBase64.length; i += CHUNK_SIZE) {
                    chunks.push(compressedBase64.substring(i, i + CHUNK_SIZE));
                }

                await saveDocRef.set({
                    name: fileName,
                    lastModified,
                    totalChunks: chunks.length
                });

                const BATCH_SIZE = 10;
                for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                    const batch = db.batch();
                    const currentBatchChunks = chunks.slice(i, i + BATCH_SIZE);
                    currentBatchChunks.forEach((chunk, indexInBatch) => {
                        const globalIndex = i + indexInBatch;
                        const chunkRef = saveDocRef.collection('chunks').doc(globalIndex.toString());
                        batch.set(chunkRef, { data: chunk });
                    });
                    await batch.commit();
                }
            }"""
new_autosave = """const compressedBase64 = compressData(currentStateString);
            const lastModified = Date.now();

            const { error: saveError } = await supabase.from('canvas_saves').upsert({
                id: fileId,
                user_id: currentUser.id,
                name: fileName,
                last_modified: lastModified,
                packed_data: compressedBase64
            });
            if (saveError) throw saveError;"""
content = content.replace(old_autosave, new_autosave)

# 8. Fetch saves list
old_fetch = """const snapshot = await db.collection('users').doc(currentUser.uid).collection('saves').orderBy('lastModified', 'desc').get();
        const list = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            name: doc.data().name,
            lastModified: doc.data().lastModified
        }));"""
new_fetch = """const { data, error } = await supabase.from('canvas_saves')
            .select('id, name, last_modified')
            .eq('user_id', currentUser.id)
            .order('last_modified', { ascending: false });
        if (error) throw error;
        const list = data.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            lastModified: doc.last_modified
        }));"""
content = content.replace(old_fetch, new_fetch)

# 9. Handle Save
old_save = """if (currentUser) {
        const userSavesRef = db.collection('users').doc(currentUser.uid).collection('saves');
        let saveDocRef;

        if (targetId) {
            // Overwriting specific file (Quick Save or Overwrite button)
            saveDocRef = userSavesRef.doc(targetId);
            // Must clear old chunks
            await deleteCollection(saveDocRef.collection('chunks'));
        } else {
             // Saving as new file (or check duplicates)
            const querySnapshot = await userSavesRef.where('name', '==', saveName).get();
            if (!querySnapshot.empty) {
                if (!window.confirm(`Cloud: A save with the name "${saveName}" already exists. Do you want to overwrite it?`)) {
                    setIsProcessingCloud(null);
                    return;
                }
                saveDocRef = querySnapshot.docs[0].ref;
                await deleteCollection(saveDocRef.collection('chunks'));
            } else {
                saveDocRef = userSavesRef.doc();
            }
        }

        if (compressedBase64.length <= CHUNK_SIZE) {
             await saveDocRef.set({
                name: saveName,
                lastModified,
                packedData: compressedBase64,
                totalChunks: 0
            });
        } else {
            const chunks: string[] = [];
            for (let i = 0; i < compressedBase64.length; i += CHUNK_SIZE) {
                chunks.push(compressedBase64.substring(i, i + CHUNK_SIZE));
            }

            await saveDocRef.set({
                name: saveName,
                lastModified,
                totalChunks: chunks.length
            });

            const BATCH_SIZE = 10;
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batch = db.batch();
                const currentBatchChunks = chunks.slice(i, i + BATCH_SIZE);
                currentBatchChunks.forEach((chunk, indexInBatch) => {
                    const globalIndex = i + indexInBatch;
                    const chunkRef = saveDocRef.collection('chunks').doc(globalIndex.toString());
                    batch.set(chunkRef, { data: chunk });
                });
                await batch.commit();
            }
        }
        
        setCurrentFileId(saveDocRef.id);
        await fetchSavesList();"""

new_save = """if (currentUser) {
        let saveId = targetId;

        if (!targetId) {
            const { data: existing } = await supabase.from('canvas_saves')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('name', saveName)
                .single();
                
            if (existing) {
                if (!window.confirm(`Cloud: A save with the name "${saveName}" already exists. Do you want to overwrite it?`)) {
                    setIsProcessingCloud(null);
                    return;
                }
                saveId = existing.id;
            } else {
                saveId = generateId();
            }
        }
        
        const { error: saveError } = await supabase.from('canvas_saves').upsert({
            id: saveId,
            user_id: currentUser.id,
            name: saveName,
            last_modified: lastModified,
            packed_data: compressedBase64
        });
        if (saveError) throw saveError;
        
        setCurrentFileId(saveId!);
        await fetchSavesList();"""
content = content.replace(old_save, new_save)

# 10. Generate Share Link
old_share = """const docRef = db.collection('sharedCanvases').doc();
        
        if (compressedBase64.length <= CHUNK_SIZE) {
            await docRef.set({ 
                packedData: compressedBase64,
                version: 2,
                createdAt: new Date().toISOString()
            });
        } else {
            const chunks: string[] = [];
            for (let i = 0; i < compressedBase64.length; i += CHUNK_SIZE) {
                chunks.push(compressedBase64.substring(i, i + CHUNK_SIZE));
            }
            
            await docRef.set({
                version: 2,
                createdAt: new Date().toISOString(),
                totalChunks: chunks.length,
            });

            const BATCH_SIZE = 10; 
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batch = db.batch();
                const currentBatchChunks = chunks.slice(i, i + BATCH_SIZE);
                
                currentBatchChunks.forEach((chunkData, indexInBatch) => {
                    const globalIndex = i + indexInBatch;
                    const chunkRef = docRef.collection('chunks').doc(globalIndex.toString());
                    batch.set(chunkRef, { index: globalIndex, data: chunkData });
                });
                
                await batch.commit();
            }
        }

        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}#sharedCanvas=${docRef.id}`;"""

new_share = """const newId = generateId();
        const { error } = await supabase.from('shared_canvases').insert({
            id: newId,
            packed_data: compressedBase64,
            version: 2
        });
        if (error) throw error;
        
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}#sharedCanvas=${newId}`;"""
content = content.replace(old_share, new_share)

# 11. Handle Load
old_load = """const saveDocRef = db.collection('users').doc(currentUser.uid).collection('saves').doc(id);
                const docSnap = await saveDocRef.get();
                
                if (!docSnap.exists) throw new Error("Save not found in cloud.");
                
                const data = docSnap.data();
                loadedName = data.name;
                let finalPackedData = '';
                
                if (data.packedData) {
                    finalPackedData = data.packedData;
                } else if (data.totalChunks) {
                    const chunksSnapshot = await saveDocRef.collection('chunks').get();
                    const sortedChunks = chunksSnapshot.docs.sort((a: any, b: any) => parseInt(a.id) - parseInt(b.id));
                    sortedChunks.forEach((chunkDoc: any) => {
                        finalPackedData += chunkDoc.data().data;
                    });
                }"""

new_load = """const { data, error } = await supabase.from('canvas_saves')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error || !data) throw new Error("Save not found in cloud.");
                
                loadedName = data.name;
                let finalPackedData = data.packed_data || '';"""
content = content.replace(old_load, new_load)

# 12. Handle Delete
old_del_save = """const saveDocRef = db.collection('users').doc(currentUser.uid).collection('saves').doc(id);
                 await deleteCollection(saveDocRef.collection('chunks')); 
                 await saveDocRef.delete();"""
new_del_save = """const { error } = await supabase.from('canvas_saves').delete().eq('id', id);
                 if (error) throw error;"""
content = content.replace(old_del_save, new_del_save)

# fix currentUser.uid -> currentUser.id
content = content.replace("currentUser.uid", "currentUser.id")


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
