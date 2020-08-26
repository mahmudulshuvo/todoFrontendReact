import React, {useState, useEffect} from 'react';
import './App.css';

const App=() => {
  const [todoList, setTodoList]=useState([])
  const [activeItem, setActiveItem]=useState({id: null, title: '', completed: false})
  const [editing, setEditing]=useState(false)

  useEffect(() => {
    // Update the document title using the browser API
    fetchTasks()
  }, []);

  const getCookie=(name) => {
    var cookieValue=null;
    if (document.cookie&&document.cookie!=='') {
      var cookies=document.cookie.split(';');
      for (var i=0; i<cookies.length; i++) {
        var cookie=cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length+1)===(name+'=')) {
          cookieValue=decodeURIComponent(cookie.substring(name.length+1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const fetchTasks= async () => {
    console.log('Fetching...')
    const response=await fetch('http://127.0.0.1:8000/api/tasks/', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache', 
      credentials: 'same-origin', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token 5851469cc576d09384556c4413f98ae9ffdea98b'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer', 
    })
    let tasklist = await response.json()
    setTodoList(tasklist.tasks)

  }

  const startEdit=(task) => {
    setActiveItem(task)
    setEditing(true)
  }


  const deleteItem=(task) => {
    var csrftoken=getCookie('csrftoken')

    fetch(`http://127.0.0.1:8000/api/tasks/${task.id}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Token 5851469cc576d09384556c4413f98ae9ffdea98b',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {
      fetchTasks()
    })
  }

  const strikeUnstrike=(task) => {
    task.completed=!task.completed
    var csrftoken=getCookie('csrftoken')
    var url=`http://127.0.0.1:8000/api/tasks/${task.id}`

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Token 5851469cc576d09384556c4413f98ae9ffdea98b',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({
        'task': {
          'completed': task.completed,
          'title': task.title
        }
      })
    }).then(() => {
      fetchTasks()
    })

    console.log('TASK:', task.completed)
  }

  const handleSubmit=(e) => {
    e.preventDefault()
    console.log('ITEM:', activeItem)

    var csrftoken=getCookie('csrftoken')

    var url='http://127.0.0.1:8000/api/tasks/'

    if (editing) {
      url=`http://127.0.0.1:8000/api/tasks/${activeItem.id}`
      setEditing(false)
    }

    fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': 'Token 5851469cc576d09384556c4413f98ae9ffdea98b',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({'task': activeItem})
    }).then((response) => {
      fetchTasks()
      setActiveItem({
        id: null,
        title: '',
        completed: false,
      })
    }).catch(function (error) {
      console.log('ERROR:', error)
    })
  }

  const handleChange=(e) => {
    console.log('called handleChange')
    e.preventDefault()
    var name=e.target.name
    var value=e.target.value
    console.log('Name:', name)
    console.log('Value:', value)
    setActiveItem({...activeItem, title: value})

  }

  return (
    <div className="container">
      <div id="task-container">
        <div id="form-wrapper">
          <form onSubmit={(e) => handleSubmit(e)} id="form">
            <div className="flex-wrapper">
              <div style={{flex: 6}}>
                <input onChange={(e) => handleChange(e)} className="form-control" id="title" value={activeItem.title} type="text" name="title" placeholder="Add task.." />
              </div>

              <div style={{flex: 1}}>
                <input id="submit" className="btn btn-warning" type="submit" name="Add" />
              </div>
            </div>
          </form>

        </div>

        <div id="list-wrapper">
          {todoList.map(function (task, index) {
            return (
              <div key={index} className="task-wrapper flex-wrapper">

                <div onClick={() => strikeUnstrike(task)} style={{flex: 7}}>

                  {task.completed===false? (
                    <span>{task.title}</span>

                  ):(

                      <strike>{task.title}</strike>
                    )}

                </div>

                <div style={{flex: 1}}>
                  <button onClick={() => startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                </div>

                <div style={{flex: 1}}>
                  <button onClick={() => deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
                </div>

              </div>
            )
          })}
        </div>
      </div>

    </div>
  );
}

export default App;
