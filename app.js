// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getDatabase, ref, set, push, get } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAT264mzWHI9mUhpXPBj239yWWKzaCk8uo",
    authDomain: "notes-web-application-447603.firebaseapp.com",
    databaseURL: "https://notes-web-application-447603-default-rtdb.firebaseio.com",
    projectId: "notes-web-application-447603",
    storageBucket: "notes-web-application-447603.appspot.com",
    messagingSenderId: "617282599829",
    appId: "1:617282599829:web:8efa8871fbbcf6c160149c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Elements
const welcomeContainer = document.getElementById("welcome-container");
const appContainer = document.getElementById("app-container");
const userNameElement = document.getElementById("userName");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const signOutBtn = document.getElementById("signOutBtn"); // Added Sign-Out button
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let userName = "";

// Sign up new user
signupBtn.addEventListener("click", () => {
    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
        alert("Please enter your name, email, and password.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Store name in the database
            set(ref(database, 'users/' + user.uid), {
                name: name,
                email: email,
            });
            alert("Account created successfully!");
            signInUser(email, password);  // Automatically sign in after signup
        })
        .catch((error) => {
            console.error("Error creating account: ", error);
            alert(error.message);
        });
});

// Sign in existing user
loginBtn.addEventListener("click", () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email.trim() === "" || password.trim() === "") {
        alert("Please enter your email and password.");
        return;
    }

    signInUser(email, password);
});

// Function to sign in user
function signInUser(email, password) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Fetch user's name from the database
            const userRef = ref(database, 'users/' + user.uid);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    userName = userData.name;
                    userNameElement.textContent = "Welcome, " + userName;
                }
            });

            // Hide the welcome screen and show the app
            welcomeContainer.style.display = "none";
            appContainer.style.display = "block";
            loadNotes();
        })
        .catch((error) => {
            console.error("Error signing in: ", error);
            alert(error.message);
        });
}

// Listen for auth state changes (whether user is logged in or logged out)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, show the app container
        const userRef = ref(database, 'users/' + user.uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                userName = userData.name;
                userNameElement.textContent = "Welcome, " + userName;
            }
        });

        welcomeContainer.style.display = "none";
        appContainer.style.display = "block";
        loadNotes();
    } else {
        // User is signed out, show the login page
        welcomeContainer.style.display = "block";
        appContainer.style.display = "none";
    }
});

// Add note functionality
document.getElementById("addNoteBtn").addEventListener("click", () => {
    const noteTitle = document.getElementById("note-title").value;
    const noteContent = document.getElementById("note-content").value;

    if (noteTitle.trim() === "" || noteContent.trim() === "") {
        alert("Please fill in all fields.");
        return;
    }

    const userNotesRef = ref(database, `users/${auth.currentUser.uid}/notes/`);
    const newNoteRef = push(userNotesRef);

    set(newNoteRef, {
        title: noteTitle,
        content: noteContent,
    })
        .then(() => {
            alert("Note added successfully!");
            document.getElementById("note-title").value = "";
            document.getElementById("note-content").value = "";
            loadNotes();
        })
        .catch((error) => console.error("Error adding note:", error));
});

// Sign out functionality
signOutBtn.addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("You have successfully signed out.");
            welcomeContainer.style.display = "block";
            appContainer.style.display = "none";
            emailInput.value = "";
            passwordInput.value = "";
        })
        .catch((error) => console.error("Error signing out:", error));
});

// Load notes from Firebase
function loadNotes() {
    const noteList = document.getElementById("note-list");
    noteList.innerHTML = "";

    const userNotesRef = ref(database, `users/${auth.currentUser.uid}/notes/`);

    get(userNotesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const note = childSnapshot.val();
                    const noteElement = createNoteElement(note.title, note.content);
                    noteList.appendChild(noteElement);
                });
            }
        })
        .catch((error) => console.error("Error loading notes:", error));
}

// Create a note element
function createNoteElement(title, content) {
    const noteItem = document.createElement("div");
    noteItem.classList.add("note-item");

    const titleElement = document.createElement("h4");
    titleElement.textContent = title;

    const contentElement = document.createElement("p");
    contentElement.textContent = content;

    noteItem.appendChild(titleElement);
    noteItem.appendChild(contentElement);

    return noteItem;
}
