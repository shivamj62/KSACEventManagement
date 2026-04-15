const { db, admin } = require('../config/firebase');

// Register a new user in the Firestore database
const registerUser = async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { name, studentId, role } = req.body;

    // Validate roles
    const validRoles = ['student', 'fic', 'ksac_core', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    const userData = {
      uid,
      name,
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (role === 'student') {
      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required for students.' });
      }
      userData.studentId = studentId;
    }

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({ message: 'User registered successfully', user: userData });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error while registering user.' });
  }
};

// Fetch users by a specific role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['student', 'fic', 'ksac_core', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided.' });
    }

    const snapshot = await db.collection('users').where('role', '==', role).get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        uid: data.uid,
        name: data.name,
        email: data.email,
        role: data.role
      });
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(`Error fetching users with role ${req.params.role}:`, error);
    res.status(500).json({ message: 'Internal server error fetching users by role.' });
  }
};

module.exports = {
  registerUser,
  getUsersByRole
};
