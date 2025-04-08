import admin from 'firebase-admin'

// Create a new list
export const createNewList = async (boardId, list, listOrder) => {
  const listRef = admin.firestore().collection('lists').doc()
  const listData = {
    id: listRef.id,
    boardId,
    ...list,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await listRef.set(listData)

  // Update board's list order
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  await boardRef.update({
    listOrder,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return listData
}

// Reorder lists
export const reorderLists = async (boardId, listOrder) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  await boardRef.update({
    listOrder,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { boardId, listOrder }
}

// Rename list
export const renameList = async (listId, title) => {
  const listRef = admin.firestore().collection('lists').doc(listId)
  await listRef.update({
    title,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { listId, title }
}

// Remove list
export const removeList = async (listId) => {
  const listRef = admin.firestore().collection('lists').doc(listId)
  await listRef.delete()

  return { listId }
}
