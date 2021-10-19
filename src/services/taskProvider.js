
import { BaseModel } from "../models/BaseModel";
import { getFromStorage, addToStorage, removeFromStorage } from "../utils";


 export  const StatusList= {
    BackLog :0,
     Ready : 1,
     InProgress : 2,
     Finished : 3,
     list : ["BackLog","Ready","InProgress","Finished"],
     nameList: ["BackLog","Ready","In Progress","Finished"]
}


export class Task extends BaseModel {
    constructor(name) {
        super();
        this.name = name;
        this.status = StatusList.BackLog;
    }    
}

export const removeTasks = function(user)
{
    removeFromStorage(getUserKey(user));
}

export const  saveTasks = function(user, tasks)
{
    removeTasks(user);
    for(let task of tasks)
    {
        addToStorage(task, getUserKey(user));
    }
}

function getUserKey(user) {
   return `user_${user.login}_taskList`;
}

export const  getTasks = function(user)
{
    
    let tasks = getFromStorage(getUserKey(user));
    if(tasks.length==0)
        tasks = createTestTaskList();
        
    return  tasks;

}

function createTestTaskList()
{
    let task1 = new Task(`Task1`);
    let task2 = new Task(`Task2`);
    task2.status = StatusList.Ready;
    let task3 = new Task(`Task3`);
    task3.status = StatusList.InProgress;
    let task4 = new Task(`Task4`);
    task4.status = StatusList.InProgress;
    return [task1, task2, task3, task4];
}