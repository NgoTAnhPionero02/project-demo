import admin from 'firebase-admin'

// Create a new user
export const createNewUser = async (uid, email, name, picture) => {
  const userRef = admin.firestore().collection('users').doc(uid)
  const userData = {
    uid,
    email,
    name,
    picture,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }

  await userRef.set(userData)
  return userData
}

// Return user data
export const returnUserData = async (uid) => {
  const userRef = admin.firestore().collection('users').doc(uid)
  const userDoc = await userRef.get()

  if (!userDoc.exists) {
    throw new Error('User not found')
  }

  return userDoc.data()
}
