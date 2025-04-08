import admin from 'firebase-admin'

// Create a new task
export const createNewTask = async (boardId, task, listId, taskIds) => {
  try {
    const taskRef = admin.firestore().collection('tasks').doc()
    const taskData = {
      id: taskRef.id,
      boardId,
      listId,
      ...task,
      order: taskIds.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await taskRef.set(taskData)
    return taskData
  } catch (error) {
    throw error
  }
}

// Reorder tasks in same list
export const reorderTasksInSameList = async (boardId, listId, taskIds) => {
  try {
    const tasksRef = admin.firestore().collection('tasks')
    const tasksSnapshot = await tasksRef
      .where('boardId', '==', boardId)
      .where('listId', '==', listId)
      .get()

    const batch = admin.firestore().batch()
    tasksSnapshot.docs.forEach((doc) => {
      const taskId = doc.id
      const newOrder = taskIds.indexOf(taskId)
      if (newOrder !== -1) {
        batch.update(doc.ref, {
          order: newOrder,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    })

    await batch.commit()
    return { boardId, listId, taskIds }
  } catch (error) {
    throw error
  }
}

// Switch tasks between lists
export const switchTasksBetweenLists = async (boardId, lists) => {
  try {
    const tasksRef = admin.firestore().collection('tasks')
    const batch = admin.firestore().batch()

    for (const [listId, taskIds] of Object.entries(lists)) {
      const tasksSnapshot = await tasksRef
        .where('boardId', '==', boardId)
        .where('listId', '==', listId)
        .get()

      tasksSnapshot.docs.forEach((doc) => {
        const taskId = doc.id
        const newOrder = taskIds.indexOf(taskId)
        if (newOrder !== -1) {
          batch.update(doc.ref, {
            order: newOrder,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      })
    }

    await batch.commit()
    return { boardId, lists }
  } catch (error) {
    throw error
  }
}

// Update task property
export const updateTaskProperty = async (boardId, taskId, property, data) => {
  try {
    const taskRef = admin.firestore().collection('tasks').doc(taskId)
    const taskDoc = await taskRef.get()

    if (!taskDoc.exists) {
      throw new Error('Task not found')
    }

    const updateData = {
      [property]: data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await taskRef.update(updateData)
    return { boardId, taskId, [property]: data }
  } catch (error) {
    throw error
  }
}
