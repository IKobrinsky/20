export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const checkStorage = function(key)
{
  return localStorage.getItem(key)!=null;
}

export const removeFromStorage = function(key)
{
  localStorage.removeItem(key);
}

export const addToStorage = function (obj, key) {
  
  const storageData = getFromStorage(key);
  let oldItemIndex = storageData.map(item=>item.id).indexOf(obj.id);
  if (oldItemIndex>=0)
    storageData.splice(oldItemIndex,1);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const removeItemFromStorage = function(obj, key)
{
  const storageData = getFromStorage(key);
  let oldItemIndex = storageData.map(item=>item.id).indexOf(obj.id);
  if (oldItemIndex>=0)
    storageData.splice(oldItemIndex,1);
  localStorage.setItem(key, JSON.stringify(storageData));
}

export const generateTestUser = function (User) {

  const testUser = new User("a", "1");
  testUser.isAdmin = true;
  
  if(!checkStorage(testUser.storageKey))
    User.save(testUser);
};
