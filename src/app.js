import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";

import noAccessTemplate from "./templates/noAccess.html";
import userMenu from "./templates/userMenu.html";
import loginMenu from "./templates/login.html";
import welcomeTemplate from "./templates/welcome.html";
import { User, getUsers, checkUsers } from "./models/User";
import { generateTestUser } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import * as taskProvider from "./services/taskProvider";

import {createDropDown, updateSelector, getSelectedTaskId} from './templates/dropdown';
import {initUserMenu} from './templates/usermenu';

export const appState = new State();

let loginForm = document.querySelector("#app-login-form");
const header = document.querySelector(".header-formheader");

const windowStates = {users:1, tasks:2, none:0}

var taskRanges = new Map();
var tasks;

generateTestUser(User);

const taskContainer = document.querySelector('.taskContainer');
const userContainer = document.querySelector('.userContainer');

loginForm.addEventListener("submit", function (e) { doLogin(e) } );

function doLogin(e)
{
  e.preventDefault();
  
  const formData = new FormData(loginForm);
  const login = formData.get("login");
  
  const password = formData.get("password");
  let fieldHTMLContent;
  
  if (authUser(login, password))
  {
    header.innerHTML = userMenu;
    initUserMenu();
    fieldHTMLContent = welcomeTemplate;
    
  }
  else
  {
    fieldHTMLContent = noAccessTemplate;
  }
}

let users;
export const showUsers = function()
{
    taskContainer.style.display='none';
    userContainer.style.display='flex';
    createUserList();
    appState.windowState = windowStates.users;
    updateInfoFields();
}

export const showTasks = function()
{
    userContainer.style.display='none';
    taskContainer.style.display='flex';
    taskContainer.innerHTML="";
    createTaskRanges();
    createTaskList();
    updateButtonStatuses();
    appState.windowState = windowStates.tasks;
    updateInfoFields();
}

export const logOff = function()
{
  taskContainer.innerHTML='';
  header.innerHTML=loginMenu;
  loginForm = document.querySelector("#app-login-form");
  loginForm.addEventListener("submit", function (e) { doLogin(e) } );
  appState.windowState = windowStates.none;
  updateInfoFields();
 // taskContainer.style.display='none';
  //loginForm.style.display="block";
}

function createTaskRanges()
{
  taskRanges.clear();
  for(let range of taskProvider.StatusList.list)
  {
    let div = document.createElement("div");
    div.classList.add("div-taskRange");
    taskRanges.set(range, div);
    taskContainer.insertAdjacentElement('beforeend', div);
  }
}

function createTaskList()
{
  tasks = taskProvider.getTasks(appState.currentUser);
  
  for(let [rangeName, rangeDiv] of taskRanges)
  {
    let taskListHeader = document.createElement('div');
    taskListHeader.classList.add('div-taskListHeader');
    taskListHeader.innerHTML=taskProvider.StatusList.nameList[taskProvider.StatusList[rangeName]];
    rangeDiv.insertAdjacentElement('beforeend', taskListHeader);
    let taskListDiv = document.createElement('div');
    taskListDiv.classList.add('div-taskList');
    rangeDiv.insertAdjacentElement('beforeend', taskListDiv);
  }
  for(let task of tasks)
  {
    let taskDiv = createTaskDiv(task);
    getTaskRange(task).querySelector('.div-taskList').insertAdjacentElement('beforeend', taskDiv);
  }
  createButtons();
}

function createUserList(skipUsersUpdate)
{
  if(!skipUsersUpdate)
    users = getUsers();
  
  let userListDiv = userContainer.querySelector('.div-userList');
  userListDiv.innerHTML='';
  users.forEach(user => {
    let userDiv=createUserDiv(user);
    userListDiv.insertAdjacentElement('beforeend', userDiv);
  });

  let buttonDiv = document.createElement('div');
    buttonDiv.innerHTML=`<button type="button"
    class="btn btn-add  "
     >+ Add user</button>`;
     userListDiv.insertAdjacentElement('beforeend', buttonDiv.firstChild);
    let button = userListDiv.querySelector(`.btn-add`);
    button.addEventListener('click', ()=>{addUser()});
    
}

function updateRangeTasks(rangeName)
{
  let rangeId = taskProvider.StatusList[rangeName];
  let range = taskRanges.get(rangeName);
  let taskListDiv = range.querySelector('.div-taskList');
  taskListDiv.innerHTML="";
  for(let task of tasks)
  {
    if(task.status == rangeId)
    {
      let taskDiv = createTaskDiv(task);
      taskListDiv.insertAdjacentElement('beforeend', taskDiv);
    }
  }
}
 
//#region buttons
function createButtons()
{
  let firstRange = true;
  for (let [rangeName, rangeDiv] of taskRanges)
  {
    let buttonDiv = document.createElement('div');
    buttonDiv.innerHTML=`<button type="button"
    class="btn btn-add"
     rangeName='${rangeName}'>+ Add card</button>`;
    rangeDiv.insertAdjacentElement('beforeend', buttonDiv.firstChild);
    rangeDiv.querySelector(`.btn-add`).addEventListener('click', (event)=>{buttonAddClick(event)});
    
    if (firstRange)
    {
      let input = document.createElement('input');
      input.placeholder="New task title";
      input.style.display = "none";
      input.classList.add("addTaskInput");
      rangeDiv.insertAdjacentElement('beforeend', input);
      firstRange = false;
    }
    else
    {
      let select = createDropDown(rangeDiv);
      select.style.display = "none";
      rangeDiv.insertAdjacentElement('beforeend', select);
    }
    buttonDiv = document.createElement('div');
    buttonDiv.innerHTML=`<button type="button"
    class="btn btn-submit  "
     rangeName='${rangeName}'>Submit</button>`;
    rangeDiv.insertAdjacentElement('beforeend', buttonDiv.firstChild);
    let button = rangeDiv.querySelector(`.btn-submit`);
    button.addEventListener('click', (event)=>{buttonSubmitClick(event)});
    button.style.display = "none";
  }
  
}

const buttonAddClick = (event) => {
  let rangeName = event.target.getAttribute('rangeName');
  startAddTask (rangeName) ;
}

const buttonSubmitClick = (event) => {
  let rangeName = event.target.getAttribute('rangeName');
  submitTask (rangeName) ;
}

function startAddTask(rangeName)
{
  let range = taskRanges.get(rangeName);
  let taskCandidates = getTaskCandidates(rangeName)
  if (taskCandidates.length>0 || taskProvider.StatusList[rangeName]==0)
  {
    range.querySelector(".addTaskInput").style.display = "block";
    if(taskCandidates.length>0)
      updateSelector(range.querySelector(".addTaskInput"), taskCandidates);
    else
      range.querySelector(".addTaskInput").value="";
    range.querySelector(`.btn-submit`).style.display = "block";
    range.querySelector(`.btn-add`).style.display = "none";
  }
}

function submitTask(rangeName)
{
  let range = taskRanges.get(rangeName);
  let taskInput = range.querySelector(".addTaskInput");
  let rangeId = taskProvider.StatusList[rangeName];
  
  if (rangeId>0)
  {
    let taskId = getSelectedTaskId(taskInput);
    tasks.forEach(task => {
      if(task.id == taskId)
        task.status = rangeId;
    });
    updateRangeTasks(rangeName);
    let sourceRangeName = taskProvider.StatusList.list[rangeId-1];
    updateRangeTasks(sourceRangeName);
  }
  else
  {
    if(taskInput.value.length>0)
      tasks.push(new taskProvider.Task(taskInput.value));
    updateRangeTasks(rangeName);
  }
  if (rangeId<taskProvider.StatusList.list.length-1)
  {
    let nextRangeName=taskProvider.StatusList.list[rangeId+1];
    updateSelector(taskRanges.get(nextRangeName).querySelector('.addTaskInput'), getTaskCandidates(nextRangeName));
  }
  
  taskInput.style.display="none";
  range.querySelector(`.btn-submit`).style.display = "none";
  range.querySelector(`.btn-add`).style.display = "block";
  taskProvider.saveTasks(appState.currentUser, tasks);
  updateButtonStatuses();
  updateInfoFields();
}

function updateButtonStatuses()
{
  let taskCounts = tasks.reduce(function(r,a)
  {
    r[a.status] = r[a.status] || 0;
    r[a.status]++;
    return r;
  }, Object.create(null)
  );

  for (let [rangeName, rangeDiv] of taskRanges){
    if(taskProvider.StatusList[rangeName]>0)
    {
      if((taskCounts[taskProvider.StatusList[rangeName]-1]||0)==0)
        rangeDiv.querySelector(`.btn-add`).setAttribute('disabled', 'disabled');
      else
        rangeDiv.querySelector(`.btn-add`).removeAttribute('disabled');
    }
  };
}

function updateInfoFields()
{
  if(appState.windowState == windowStates.tasks)
  {
    let taskCounts = tasks.reduce(function(r,a)
    {
      let finished = a.status == taskProvider.StatusList.list.length-1 ? 1 : 0;
      r[finished] = r[finished] || 0;
      r[finished]++;
      return r;
    }, Object.create(null)
    );
    document.querySelector('.div-activeTasks').innerHTML = `Active tasks: ${taskCounts[0] || 0}`;
    document.querySelector('.div-finishedTasks').innerHTML =`Finished tasks: ${taskCounts[1] || 0}`;
  }
  else
  {
    document.querySelector('.div-activeTasks').innerHTML = ``;
    document.querySelector('.div-finishedTasks').innerHTML =``;
  }
}

//#endregion

function getTaskRange(task)
{
  return taskRanges.get(taskProvider.StatusList.list[task.status]);
}

function getTaskRangeName(task)
{
  return taskProvider.StatusList.list[task.status];
}

function createTaskDiv(task)
{
    let div = document.createElement('div') ;
    div.classList.add('div-task');
    div.innerHTML = `<div class="div-taskname div-taskid_${task.id}">`+task.name+'</div>'

    let buttonDiv = document.createElement('div');
    buttonDiv.innerHTML=`<button type="button"
    class="btn-ico btn-delete-task  "
     taskid='${task.id}'><img src="https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/20/000000/external-delete-multimedia-kiranshastry-gradient-kiranshastry.png"/></button>`;
     div.insertAdjacentElement('beforeend', buttonDiv.firstChild);
    let button = div.querySelector(`.btn-delete-task`);
    button.addEventListener('click', (event)=>{deleteTask(event)});

    buttonDiv = document.createElement('div');
    buttonDiv.innerHTML=`<button type="button"
    class="btn-ico btn-edit-task btn-edit-taskid_${task.id}"
     taskid='${task.id}'><img src="https://img.icons8.com/nolan/20/edit--v1.png"/></button>`;
     div.insertAdjacentElement('beforeend', buttonDiv.firstChild);
    button = div.querySelector(`.btn-edit-task`);
    button.addEventListener('click', (event)=>{editTask(event)});


    return div;
}
function createUserDiv(user)
{
  let div = document.createElement('div') ;
  div.innerHTML=`<div class="div-user div-user_${user.id}"></div>`
  div=div.firstChild;
  div.innerHTML = `<div class="div-userlogin">`+user.login+`</div>`;
 
  let buttonDiv = document.createElement('div');
  buttonDiv.innerHTML=`<button type="button"
  class="btn-ico btn-delete-task  "
    userid='${user.id}'><img src="https://img.icons8.com/external-kiranshastry-gradient-kiranshastry/20/000000/external-delete-multimedia-kiranshastry-gradient-kiranshastry.png"/></button>`;
  div.insertAdjacentElement('beforeend', buttonDiv.firstChild);
  let button = div.querySelector(`.btn-delete-task`);
  button.addEventListener('click', (event)=>{deleteUser(event)});
    
  buttonDiv = document.createElement('div');
  buttonDiv.innerHTML=`<button type="button"
    class="btn-ico btn-edit-task" 
    userid='${user.id}'><img src="https://img.icons8.com/nolan/20/edit--v1.png"/></button>`;
  div.insertAdjacentElement('beforeend', buttonDiv.firstChild);     
  button = div.querySelector(`.btn-edit-task`);
  button.addEventListener('click', (event)=>{editUser(event)});

  div.insertAdjacentElement('beforeend', createEditUserDiv(user));
  return div;
}

function createEditUserDiv(user)
{
  let div = document.createElement('div');
  
  div.classList.add(`div-edituser`);
 
  div.innerHTML=`<div class="div-edituser-part">
  <div>
    <label class="label-user-edit" for="logininput${user.id}">Login:</label>
  </div>
  <div>
    <label class="label-user-edit" for="pwdinput${user.id}">Password:</label>
  </div>`
  + (appState.currentUser.isAdmin ?
  `<div>
    <label class="label-user-edit" for="check-admin_${user.id}">Admin</label>
  </div>` : '')
    +
  `</div>
  <div class="div-edituser-part">
    <div>
      <input type="text" id="logininput${user.id}" autocomplete="off" class="input-user" />
    </div>
    <div>
      <input type="password" id="pwdinput${user.id}" autocomplete="off" class="input-user"/>
    </div>`
+  (appState.currentUser.isAdmin ?
    `<div>
      <input type="checkbox" class="check-admin" id="check-admin_${user.id}" autocomplete="off"/>
    </div>` : '')
    +
  `</div>`
  
  return div;
}

function addUser()
{
  let newUser = new User("New user", "");
  users.push(newUser);
  //let userDiv = createUserDiv(newUser);
  createUserList(true);
  //userContainer.querySelector('.div-userList').insertAdjacentElement('beforeend',userDiv);
  doEditUser(newUser.id);
}

const deleteUser = (event) =>
{
  let userId = event.currentTarget.getAttribute('userid');
  let userIndex = users.map(item => item.id).indexOf(userId);
  let user = users[userIndex];
  taskProvider.removeTasks(user);
  User.delete(user);
  createUserList();
}

const editUser = (event) =>
{
  let userId = event.currentTarget.getAttribute('userid');
  doEditUser(userId);
}

function doEditUser(userId)
{
  let userIndex = users.map(item => item.id).indexOf(userId);
  let user = users[userIndex];
  let userDiv = document.querySelector(`.div-user_${userId}`);
  let button = userDiv.querySelector(`.btn-edit-task`);
  if (button.classList.contains('pressed'))
  {
    button.classList.toggle('pressed');
    userDiv.querySelector('.div-edituser').style.display='none';
    let newLogin = userDiv.querySelector(`#logininput${userId}`).value;
    let newPassword = userDiv.querySelector(`#pwdinput${userId}`).value;
    let newIsAdmin = false
    if(appState.currentUser.isAdmin)
      newIsAdmin = userDiv.querySelector(`#check-admin_${userId}`).checked;
    if (newLogin.length>0 && newPassword.length>0)
    {
      if (checkUsers(newLogin, userId))
      {
        let userTasks = taskProvider.getTasks(user);
        taskProvider.removeTasks(user);
        user.login = newLogin;
        user.password = newPassword;
        user.isAdmin = newIsAdmin;
        User.save(user);
        taskProvider.saveTasks(user, userTasks);
        createUserList();
      }
      else
      {
        alert("There is already a user with such login!");
      }
    }
  }
  else
  {
    userDiv.querySelector(`#logininput${userId}`).value=user.login;
    userDiv.querySelector(`#pwdinput${userId}`).value=user.password;
    if(appState.currentUser.isAdmin)
      userDiv.querySelector(`#check-admin_${userId}`).checked=user.isAdmin;
    button.classList.toggle('pressed');
    userDiv.querySelector('.div-edituser').style.display='flex';

  }
}

const editTask = (event) => {
  
  let taskId = event.currentTarget.getAttribute('taskid');
  let taskIndex = tasks.map(item => item.id).indexOf(taskId);
  let task = tasks[taskIndex];
  let range = getTaskRange(task);
  let button = range.querySelector(`.btn-edit-taskid_${taskId}`);
  let div = range.querySelector(`.div-taskid_${taskId}`);
  if (button.classList.contains('pressed'))
  {
    div.setAttribute('contenteditable', false);
    button.classList.toggle('pressed');
    if(div.innerText.replaceAll(' ','').length>0)
    {
      task.name = div.innerText.replaceAll(' ','');
      if (task.status<taskProvider.StatusList.list.length-1)
      {
        let nextRangeName=taskProvider.StatusList.list[task.status+1];
        updateSelector(taskRanges.get(nextRangeName).querySelector('.addTaskInput'), getTaskCandidates(nextRangeName));
      }
      taskProvider.saveTasks(appState.currentUser, tasks);
    }
    else 
      div.innerText = task.name;
  }
  else
  {
    div.setAttribute('contenteditable', true);
    button.classList.toggle('pressed');
    div.focus();
    let range = document.createRange()
    let sel = window.getSelection()
    range.setStart(div.childNodes[0], task.name.length);
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
  }


  //let rangeName = getTaskRangeName(task);

}

const deleteTask = (event) => {
  let taskId = event.currentTarget.getAttribute('taskid');
  let taskIndex = tasks.map(item => item.id).indexOf(taskId);
  let task = tasks[taskIndex];
  let rangeName = getTaskRangeName(task);
  tasks.splice(taskIndex, 1);
  updateRangeTasks(rangeName);
  taskProvider.saveTasks(appState.currentUser, tasks);
  if (taskStatus>0)
  {
    updateSelector(taskRanges.get(rangeName).querySelector('.addTaskInput'), getTaskCandidates(rangeName));
  }
  if (task.status<taskProvider.StatusList.list.length-1)
  {
    let nextRangeName=taskProvider.StatusList.list[task.status+1];
    updateSelector(taskRanges.get(nextRangeName).querySelector('.addTaskInput'), getTaskCandidates(nextRangeName));
  }
}


function getTaskCandidates(rangeName)
{
  let sourceRangeId = taskProvider.StatusList[rangeName]-1;
  
  let taskCandidates = [];
  if (sourceRangeId>=0)
  {
    tasks.forEach(task => {
      if(task.status == sourceRangeId)
      { 
        taskCandidates.push(task);
      }
    });
  }
  return taskCandidates;
}

