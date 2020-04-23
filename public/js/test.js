const newButton = document.createElement('button');

newButton.classList.add('btn');

newButton.innerHTML = 'hello';

document.getElementsByClassName('tools')[0].appendChild(newButton);
