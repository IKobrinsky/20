import { main } from "@popperjs/core";
import dropDownTemplate from "./dropdown.html";
var intval = null;

function slideToggle(mdiv, initHeight, slideOpen) {
    window.clearInterval(intval);
    let step = initHeight/100;
    if(!slideOpen) {
        unsubscribe(mdiv);
        var h = initHeight;
        
        intval = setInterval(function(){
            h-=step;
            mdiv.style.height = h + 'px';
            if(h <= 0)
            {
                window.clearInterval(intval);
            }
            }, 1
        );
    }
    else {
        subscribe(mdiv);
        var h = 0;
        mdiv.style.display='block';
        intval = setInterval(function(){
            h+=step;
            
            mdiv.style.height = h + 'px';
            if(h >= initHeight)
                window.clearInterval(intval);
            }, 1
        );
    }
}

export const createDropDown = function(range)
{
    let div = document.createElement('div');
    div.innerHTML=dropDownTemplate;
    let dropDownDiv=div.querySelector('.dropdown');
    addListeners(dropDownDiv);
    return dropDownDiv;
}

export const addListeners = function(dropDownDiv)
{
    dropDownDiv.addEventListener('click', ()=>
    {
        
        dropDownDiv.setAttribute('tabIndex',1);
        dropDownDiv.focus();
        dropDownDiv.classList.toggle('active');
        // if(dropDownDiv.classList.contains('active'))
        //     subscribe(dropDownDiv);
        // else
        //     unsubscribe(dropDownDiv);
        slideToggle(dropDownDiv.querySelector('.dropdown-menu'),getHeight(dropDownDiv), dropDownDiv.classList.contains('active'));
    }
    );
    

}

function getHeight(dropDownDiv)
{
    let height=0;
    for(let li of dropDownDiv.getElementsByTagName('li'))
    {
        height+=47;
        if (height>=144) return 144;
    }
    
    return height;
}

export const getSelectedTaskId = function(dropDownDiv)
{
    return dropDownDiv.querySelector('.input-dropdown-value').getAttribute('value');
}

export const unsubscribe = function(dropDownDiv)
{
    dropDownDiv.removeEventListener('focusout', ()=>
    {
        dropDownDiv.classList.remove('active');
        slideToggle(dropDownDiv.querySelector('.dropdown-menu'),getHeight(dropDownDiv), false);
    }
    );
}

function subscribe(dropDownDiv)
{
    dropDownDiv.addEventListener('focusout', ()=>
    {
        dropDownDiv.classList.remove('active');
        slideToggle(dropDownDiv.querySelector('.dropdown-menu'),getHeight(dropDownDiv), false);
    }
    );
}

export const updateSelector = function(dropDownDiv, tasks)
{
    
    dropDownDiv.classList.remove('active');
    dropDownDiv.querySelector('.dropdown-menu').innerHTML='';

    for(let li of dropDownDiv.getElementsByTagName('li'))
    {
        li.removeEventListener('click', ()=>
        {
            dropDownDiv.querySelector('.input-dropdown-value').setAttribute('value', li.getAttribute('id'));
            dropDownDiv.querySelector('.span-dropdown-caption').innerText= li.innerText;
            slideToggle(dropDownDiv.querySelector('.dropdown-menu'),getHeight(dropDownDiv), false);
        });

    }

    for(let task of tasks)
    {
        let li = document.createElement('li');
        li.innerText= task.name;
        li.setAttribute('id', task.id);
        li.addEventListener('click', ()=>
        {
            dropDownDiv.querySelector('.input-dropdown-value').setAttribute('value', li.getAttribute('id'));
            dropDownDiv.querySelector('.span-dropdown-caption').innerText= li.innerText;
            slideToggle(dropDownDiv.querySelector('.dropdown-menu'),getHeight(dropDownDiv), false);
        });
        dropDownDiv.querySelector('.dropdown-menu').insertAdjacentElement('beforeend', li);
        
    }
}




