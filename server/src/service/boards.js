import admin from 'firebase-admin'

// Create a new board
export const createNewBoard = async (
  adminId,
  title,
  coverPhoto,
  visibility,
  users
) => {
  const boardRef = admin.firestore().collection('boards').doc()
  const boardData = {
    id: boardRef.id,
    admin: adminId,
    title,
    coverPhoto,
    visibility,
    users: [adminId, ...users],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await boardRef.set(boardData)
  return boardData
}

// Get board details
export const getBoardDetails = async (boardId) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  const boardDoc = await boardRef.get()

  if (!boardDoc.exists) {
    throw new Error('Board not found')
  }

  return boardDoc.data()
}

// Update board property
export const updateBoardProperty = async (boardId, property, data) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  const updateData = {
    [property]: data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await boardRef.update(updateData)
  return { boardId, [property]: data }
}

// Delete board
export const deleteBoard = async (boardId) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  const boardDoc = await boardRef.get()

  if (!boardDoc.exists) {
    throw new Error('Board not found')
  }

  await boardRef.delete()
  return { boardId, message: 'Board deleted successfully' }
}

// Invite user to board
export const inviteUser = async (boardId, address) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  const boardDoc = await boardRef.get()

  if (!boardDoc.exists) {
    throw new Error('Board not found')
  }

  const boardData = boardDoc.data()
  const updatedUsers = [...boardData.users, address]

  await boardRef.update({
    users: updatedUsers,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { boardId, users: updatedUsers }
}

// Get board related users
export const returnBoardRelatedUsers = async (userList) => {
  const usersRef = admin.firestore().collection('users')
  const userPromises = userList.map((uid) => usersRef.doc(uid).get())
  const userDocs = await Promise.all(userPromises)

  return userDocs.filter((doc) => doc.exists).map((doc) => doc.data())
}

// Get user's boards
export const returnUserRelatedBoards = async (boardList) => {
  const boardsRef = admin.firestore().collection('boards')
  const boardPromises = boardList.map((id) => boardsRef.doc(id).get())
  const boardDocs = await Promise.all(boardPromises)

  return boardDocs.filter((doc) => doc.exists).map((doc) => doc.data())
}

// Remove user from board
export const removeBoardFromUser = async (boardId, userId) => {
  const boardRef = admin.firestore().collection('boards').doc(boardId)
  const boardDoc = await boardRef.get()

  if (!boardDoc.exists) {
    throw new Error('Board not found')
  }

  const boardData = boardDoc.data()
  const updatedUsers = boardData.users.filter((uid) => uid !== userId)

  await boardRef.update({
    users: updatedUsers,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return { boardId, users: updatedUsers }
}
