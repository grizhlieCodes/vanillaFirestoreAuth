let user;
let userID;
let userEmailPrint;
let userIdPrint;
let tasks = [];

(function initialiseFirebase(){
  var firebaseConfig = {
    apiKey: "AIzaSyAKattZxSVNCvHhwXstBQVtFxH6zlcr5ao",
    authDomain: "vanillajsauth-76afb.firebaseapp.com",
    projectId: "vanillajsauth-76afb",
    storageBucket: "vanillajsauth-76afb.appspot.com",
    messagingSenderId: "804353047242",
    appId: "1:804353047242:web:7a80f327fb8140b3211233",
    measurementId: "G-LQ8DP7S3RF"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
      userEmailPrint = document.querySelector('#userEmailPrint')
      userIdPrint = document.querySelector('#userIdPrint')
      user = firebaseUser
      userID = user.uid
      userEmailPrint.textContent = user.email
      userIdPrint.textContent = userID
      fetchAllUserTasksAndRender()
    } else {
      console.log(' not logged in ')
    }
  })
})()

//Grab necessary elements
const txtEmail = document.querySelector('#txtEmail');
const txtPassword = document.querySelector('#txtPassword');

const btnLogin = document.querySelector('#btnLogin');
const btnSignUp = document.querySelector('#btnSignUp');
const btnLogout = document.querySelector('#btnLogout');
const btnVerify = document.querySelector('#btnVerify')
const btnTesting = document.querySelector('#btnTesting')

const taskInput = document.querySelector('#taskInput');
const btnAddTask = document.querySelector('#btnAddTask');
const btnRenderAllTasks = document.querySelector('#btnRenderAllTasks')
const taskList = document.querySelector('.tasks')



//When user is logged in/logged out. 

function createEventListeners() {
  //Create login
  btnLogin.addEventListener('click', (e) => {
    //Get email and pass
    const email = txtEmail.value;
    const password = txtPassword.value;

    //reset inputs
    txtEmail.value = ''
    txtPassword.value = ''

    const auth = firebase.auth();
    //Sign in
    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(err => console.log(err.message));
  })
  //Create signup
  btnSignUp.addEventListener('click', (e) => {
    //Get email and pass
    const email = txtEmail.value;
    const password = txtPassword.value;
    const auth = firebase.auth();
    //Sign in
    const promise = auth.createUserWithEmailAndPassword(email, password);
    promise
      .catch(err => console.log(err.message));
  })
  btnTesting.addEventListener('click', () => {
    console.log(firebase.auth().currentUser.uid)
  })

  btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
    user = null
    userEmailPrint.textContent = 'User Not Logged In'
    userIdPrint.textContent = 'User Not Logged In'
    resetAllLocalTasks()
  })

  btnVerify.addEventListener('click', verifyUserEmail)

  btnAddTask.addEventListener('click', e => {
    addTaskToFireBaseThenRender()
  })

  btnRenderAllTasks.addEventListener('click', e => {
    fetchAllUserTasksAndRender()
  })

  function enterKeyListener() {
    window.addEventListener('keyup', (e) => {
      //Edit a task
      if (e.key == 'Enter' && document.activeElement.classList.contains('task-text')) {
        console.log(document.activeElement)
        const input = document.activeElement
        const id = input.id
        const newText = input.value
        updateFirebaseTask(id, newText)
      }
      //Add a task
      if (e.key == 'Enter' && document.activeElement.classList.contains('taskInput')) {
        addTaskToFireBaseThenRender()
      }
    })
  }
  enterKeyListener()

}
createEventListeners()

function verifyUserEmail() {
  var currentUser = firebase.auth().currentUser;
  console.log(currentUser)

  currentUser.sendEmailVerification().then(res => console.log(res)).catch(function (error) {
    console.log(error)
  });
}

function addTaskToFireBaseThenRender() {
  if (user) {
    let taskText = taskInput.value
    taskInput.value = ''

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application.json',
      },
      body: JSON.stringify({
        taskText
      })
    }

    fetch(`https://vanillajsauth-76afb-default-rtdb.europe-west1.firebasedatabase.app/tasks/${userID}.json`, options)
      .then(res => {
        fetchAllUserTasksAndRender()
      })
  }
}

function resetAllLocalTasks() {
  taskList.innerHTML = ''
  tasks = []
}

function addFirebaseTasksToLocalTasksArray(objectFromFirebase) {
  for (const key in objectFromFirebase) {
    tasks = [...tasks, {
      ...objectFromFirebase[key],
      id: key,
    }]
  }
}

async function fetchTasks(){
  let response = await fetch(`https://vanillajsauth-76afb-default-rtdb.europe-west1.firebasedatabase.app/tasks/${userID}.json`)
    return await response.json()
} 

async function fetchAllUserTasksAndRender() {
    if (user) {
      //Without await, taskss was a promise
      //With await, taskss is a result
      let taskss = await fetchTasks()
      resetAllLocalTasks()
      addFirebaseTasksToLocalTasksArray(taskss)
      renderAllLocalTasks()
    //   fetch(`https://vanillajsauth-76afb-default-rtdb.europe-west1.firebasedatabase.app/tasks/${userID}.json`)
    //     .then((res) => {
    //       if (!res.ok) {
    //         throw new Error("Failed fetching!");
    //       }
    //       return res.json();
    //     })
    //     .then(data => {
    //       resetAllLocalTasks()
    //       addFirebaseTasksToLocalTasksArray(data)
    //       renderAllLocalTasks()
    //     })
    //     .catch(err => console.log(err))
    }
}

function renderAllLocalTasks() {
  tasks.forEach(task => {
    renderTasksToDesktop(task)
  })
}

function renderTasksToDesktop(taskObject) {

  function createTaskContainer(object) {
    let taskContainer = document.createElement('li')
    taskContainer.classList.add('task')
    return taskContainer
  }

  function createTaskParagraphInput(object) {
    let task = document.createElement('input')
    task.classList.add('task-text')
    task.id = object.id
    task.value = object.taskText
    return task
  }

  function createDeleteButton(object) {
    let button = document.createElement('button')
    button.classList.add('btnDeleteTask')
    button.id = object.id
    button.textContent = 'delete'
    button.addEventListener('click', (e) => {
      const buttonID = object.id
      deleteFirebaseTaskAndUpdateLocalTasks(buttonID)
    })

    return button
  }

  const taskContainer = createTaskContainer(taskObject)
  const taskTextParaInput = createTaskParagraphInput(taskObject)
  const deleteButton = createDeleteButton(taskObject)
  taskContainer.append(taskTextParaInput, deleteButton)
  taskList.append(taskContainer)
  
}

function deleteFirebaseTaskAndUpdateLocalTasks(buttonID) {
  let taskID = buttonID
  const options = {
    method: 'DELETE'
  }
  fetch(`https://vanillajsauth-76afb-default-rtdb.europe-west1.firebasedatabase.app/tasks/${userID}/${taskID}.json`, options)
    .then(res => {
      fetchAllUserTasksAndRender()
    })
    .catch(err => console.log(err))
}

function updateFirebaseTask(taskId, taskText) {
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskText: taskText
    })
  }
  fetch(`https://vanillajsauth-76afb-default-rtdb.europe-west1.firebasedatabase.app/tasks/${userID}/${taskId}.json`, options)
    .then(res => {
      if (!res.ok) {
        throw new Error('Failed patching')
      } else {
        fetchAllUserTasksAndRender()
      }
    })
    .catch(err => console.log(err))
}






