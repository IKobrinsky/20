export class State {
  constructor() {
    this.currentUser = null;
    this.windowState=0;
  }
  set currentUser(user) {
    this._currentUser = user;
  }
  get currentUser() {
    return this._currentUser;
  }
}
