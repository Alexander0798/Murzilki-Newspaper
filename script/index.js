const page = document.querySelector('.page')
const listPostContainer = document.querySelector('.main__list')
const listNavigationContainer = document.querySelector('.navigation__list')
const input = document.querySelector('.header__input')
const popupsPostComments = document.querySelector('.popup__comments')
const listComments = document.querySelector('.comments')
const buttonSearch = document.querySelector('.header__button-search')
const buttonAdd = document.querySelector('.header__button-add')
const formAdd = document.forms.formAdd
const arrObjPosts = []
const arrPosts = []


// удаляю темплате элементы 
const delElements = (listSelector) => {
  const listItem = Array.from(listSelector.children)
  listItem.forEach((item) => {
    item.remove()
  })
}

// получаю отфильтрованный массив элементов
const filter = () => {
  const arrFilter = arrPosts.reduce(function (a, b) {
    return a.concat(b);
  }, [])
  const arr = []
  arrFilter.forEach((item) => {
    if (item.title.includes(input.value) || item.body.includes(input.value)) {
      return arr.push(item)
    }
  })
  return arr
}
// слушатели поисковой строки
input.addEventListener('keydown', (evt) => {
  if (evt.key === 'Enter') {
    if (input.value.trim().length > 0) {
      delElements(listPostContainer)
      delElements(listNavigationContainer)
      const arrfiltr = filter()
      renderFilter(arrfiltr)
    }
    input.value = ''
    input.blur()
  }
})
buttonSearch.addEventListener('click', (evt) => {
  evt.preventDefault()
  if (input.value.trim().length > 0) {
    delElements(listPostContainer)
    delElements(listNavigationContainer)
    const arrfiltr = filter()
    renderFilter(arrfiltr)
  } else {
    input.focus()
  }
  input.value = ''

})

// собераю коментарии для попапа
const createCommentsPost = (obj) => {
  const itemElement = document.querySelector('#template-comments').content.querySelector('.comments__item').cloneNode(true)
  itemElement.querySelector('.comments__name').textContent = obj.name
  itemElement.querySelector('.comments__email').textContent = obj.email
  itemElement.querySelector('.comments__body').textContent = obj.body
  listComments.append(itemElement)
}

// открываю и собераю попап
const openPopupComments = (evt) => {
  delElements(listComments)
  document.querySelector('body').setAttribute('style', 'overflow: hidden;')
  popupsPostComments.setAttribute('style', 'display: flex')
  const postElement = evt.closest('.item')
  const popupTitle = popupsPostComments.querySelector('.popup__title')
  const popupBody = popupsPostComments.querySelector('.popup__body')
  popupTitle.textContent = postElement.querySelector('.item__title').textContent
  popupBody.textContent = postElement.querySelector('.item__description').textContent
  popupsPostComments.addEventListener('click', (evt) => {
    if (evt.target === popupsPostComments) {
      popupsPostComments.removeAttribute('style', 'display: flex')
      document.querySelector('body').removeAttribute('style', 'overflow: hidden;')
    }
  })
  fetch(`https://jsonplaceholder.typicode.com/posts/${postElement.id}/comments`)
    .then(response => response.json())
    .then((json) => {
      json.forEach((item) => {
        createCommentsPost(item)
      })
    })
}

// создаю ссылки переключения контента 
const createLink = (num, arr) => {
  const linkElement = document.querySelector('#temlate-link').content.querySelector('.navigation__item').cloneNode(true)
  const link = linkElement.querySelector('.navigation__link')
  link.textContent = num + 1
  linkElement.addEventListener('click', (evt) => {
    evt.preventDefault()

    const links = document.querySelectorAll('.navigation__link')
    links.forEach((item) => {
      item.removeAttribute('style', 'text-decoration: underline')
    })
    link.setAttribute('style', 'text-decoration: underline')
    delElements(listPostContainer)
    arr[num].forEach((item) => {
      listPostContainer.append(createItem(item))
    })
  })

  if (link.textContent === '1') {
    link.setAttribute('style', 'text-decoration: underline')
  }
  document.querySelector('.navigation__list').append(linkElement)
}
// собераю элемент статьи
const createItem = (obj) => {
  const itemElement = document.querySelector('#temlate-item').content.querySelector('.item').cloneNode(true)
  itemElement.id = obj.id
  const itemTitle = itemElement.querySelector('.item__title')
  const itemBody = itemElement.querySelector('.item__description')
  itemTitle.textContent = obj.title
  itemBody.textContent = obj.body
  itemTitle.addEventListener('click', (evt) => {
    openPopupComments(evt.target)
  })
  itemBody.addEventListener('click', (evt) => {
    openPopupComments(evt.target)
  })
  itemElement.querySelector('.item__button-del').addEventListener('click', () => {
    fetch(`https://jsonplaceholder.typicode.com/posts/${itemElement.id}`, {
      method: 'DELETE'
    })
    itemElement.remove()
  })

  return itemElement
}

// вставляю посты с api
const renderPost = (arr) => {
  while(arr.length) {
    arrPosts.push(arr.splice(0, 10))
  }
  arrPosts[0].forEach((item) => {
    listPostContainer.append(createItem(item))
  })
  for (let i = 0; i < arrPosts.length; i++) {
    createLink(i, arrPosts)
  }
}
// вставляю отфильтрованные посты
function renderFilter(arr) {
  const arrFiltrPush = []
  while(arr.length) {
    arrFiltrPush.push(arr.splice(0, 10))

  }
  if (arrFiltrPush.length > 0) {
    arrFiltrPush[0].forEach((item) => {
      listPostContainer.append(createItem(item))
    })
    for (let i = 0; i < arrFiltrPush.length; i++) {
      createLink(i, arrFiltrPush)

    }
  } else {
    delElements(listPostContainer)
    listPostContainer.insertAdjacentHTML('afterbegin', `<h2 style="text-align: center; font-size: 28px; margin: 40px 0;">Nothing was found for your query</h2`)
  }
}

// получаю массив статей
const getArrPosts = (arr) => {
  arr.forEach((item) => {
    arrObjPosts.unshift(item)
  })

  renderPost(arrObjPosts)
}
const getPosts = () => {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then((response) => response.json())
    .then((json) => getArrPosts(json))
}
getPosts()

// создаю новую статью и отправляю запрос
const createNewElement = () => {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: formAdd.formTitle.value,
      body: formAdd.formArticle.value,
      userId: 11,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((json) => listPostContainer.prepend(createItem(json)));
}
// делаю видимой форму добавления статьи и вешаю слушатель sabmite
const openForm = () => {
  formAdd.setAttribute('style', 'display: flex;')
  document.querySelector('.header__wraper-searh').setAttribute('style', 'display: none;')
  formAdd.addEventListener('submit', (evt) => {
    evt.preventDefault()
    createNewElement()
    closeForm()
  })
}
// скрываю форму добавления статьи
const closeForm = () => {
  formAdd.removeAttribute('style', 'display: flex;')
  document.querySelector('.header__wraper-searh').removeAttribute('style', 'display: none;')
  formAdd.formTitle.value = ''
  formAdd.formArticle.value = ''
  page.removeEventListener('mousedown', (evt) => {
    if (evt.target.closest('.header__wraper-add') === null) {
      closeForm()
    }
  })
}
// слушатель кнопки добавить статью
buttonAdd.addEventListener('mousedown', () => {
  openForm()
  page.addEventListener('mousedown', (evt) => {
    if (evt.target.closest('.header__wraper-add') === null) {
      closeForm()
    }
  })
})
document.querySelector('.header__button-rest').addEventListener('mousedown', ()=> {
  window.location.reload()
})