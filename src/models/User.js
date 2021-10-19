import { appState } from "../app";
import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage,  removeItemFromStorage} from "../utils";

export class User extends BaseModel {
  constructor(login, password) {
    super();
    this.login = login;
    this.password = password;
    this.storageKey = "users";
  }
  get hasAccess() {
    let users = getFromStorage(this.storageKey);
    if (users.length == 0) return false;
    for (let user of users) {
      if (user.login == this.login && user.password == this.password)
      {
        this.isAdmin = user.isAdmin;
        return  true;
      }
    }
    return false;
  } 
  static save(user) {
    try {
      addToStorage(user, user.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
  static delete(user)
  {
    removeItemFromStorage(user, user.storageKey);
  }
}

export const getUsers = function()
{
  if (appState.currentUser.isAdmin)
    return getFromStorage('users');
  else
    return [appState.currentUser];
}

export const checkUsers = function(newLogin, userId)
{
  let users = getFromStorage('users');
  let sameUser = users.filter(item=> item.id != userId && item.login == newLogin );
  return sameUser.length==0;
}