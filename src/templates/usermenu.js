import {addListeners, unsubscribe} from './dropdown';
import {showTasks, logOff, showUsers, appState} from '../app';

export const initUserMenu = function()
{
    let dropDownDiv = document.querySelector('.div-userMenu');
    
    let userMenu = dropDownDiv.querySelector('.dropdown-menu');
    let liUsers = userMenu.querySelector('.li-users');
    let liTasks = userMenu.querySelector('.li-tasks');
    let liLogoff = userMenu.querySelector('.li-logoff');

    liUsers.addEventListener('click', ()=>{showUsers();});
    liTasks.addEventListener('click', ()=>{showTasks();  });
    liLogoff.addEventListener('click', ()=>{logOff();});
    

    addListeners(dropDownDiv);
    dropDownDiv.getElementsByClassName.display='inline-block';
   document.querySelector('.h1-welcome').innerText = `Welcome, ${appState.currentUser.login}`;
}