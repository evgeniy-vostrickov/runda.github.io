const form = document.querySelector('#form_process')
const email = document.querySelector('#floating_email')
const phone = document.querySelector('#floating_phone')
const firstName = document.querySelector('#floating_first_name')
const lastName = document.querySelector('#floating_last_name')

const fields = ['email', 'first_name', 'last_name', 'phone', 'about_me']

const labelEmail = document.querySelector('[for="floating_email"]')
const labelPhone = document.querySelector('[for="floating_phone"]')
const labelName = document.querySelector('[for="floating_first_name"]')
const labelLastName = document.querySelector('[for="floating_last_name"]')


const error = text => `<span class="text-red-600 error-input">${text}</span>`
let formFillingError = false
let countSuccess = 0

// Показываем ошибку под полем
function showError(input, label, message) {
    const node = error(message)
    input.classList.add("text-red-600")
    input.classList.add("border-red-600")
    label.classList.add("text-red-600")
    input.parentElement.insertAdjacentHTML('beforeend', node)
    formFillingError = true
}

// Показываем, что поле заполнено верно
function showSuccess(input, label) {
    input.classList.remove("text-red-600")
    input.classList.remove("border-red-600")
    label.classList.remove("text-red-600")
    countSuccess++
}

// Проверка чистоты введенных данных
function dataCleanlinessCheck(formData) {
    for (const field of fields) {
        formData.set(field, formData.get(field).trim())
    }
    return formData
}

const checkEmail = (formData) => {
    const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (reg.test(formData.get('email')) && email.value.length < 100) {
        showSuccess(email, labelEmail);
    } else {
        showError(email, labelEmail, "Адрес электронной почты имеет неверный формат");
    }
}

const handleFieldPhone = (formData) => {
    formData.set('phone', formData.get('phone').replace(/\D/g, ""))
    if (formData.get('phone').length === 11) {
        showSuccess(phone, labelPhone);
    } else {
        showError(phone, labelPhone, "Телефон имеет неверный формат");
    }
    return formData
}

const checkSimpleFields = (formData) => {
    const reg = /[^а-яА-Яa-zA-Z ]/g

    if (formData.get('first_name').length < 150) {
        if (reg.test(formData.get('first_name')))
            showError(firstName, labelName, "Недопустимые символы в имени")
        else
            showSuccess(firstName, labelName);
    } else {
        showError(firstName, labelName, "Имя превышает допустимое число символов");
    }

    if (formData.get('last_name').length < 150) {
        if (reg.test(formData.get('last_name')))
            showError(lastName, labelLastName, "Недопустимые символы в фамилии")
        else
            showSuccess(lastName, labelLastName);
    } else {
        showError(lastName, labelLastName, "Фамилия превышает допустимое число символов");
    }
}

const preparationForm = () => {
    formFillingError = false
    countSuccess = 0
    document.querySelectorAll(".error-input").forEach(span => span.remove())
    document.querySelector("#alert-success").classList.add('hidden')
    document.querySelector("#alert-error").classList.add('hidden')
}

function serializeForm() {
    let formData = new FormData(document.querySelector("#form_process"));
    return formData
}

// async function sendData(data) {
//     return await fetch('/form_process.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'multipart/form-data' },
//         body: data,
//     })
// }

// Отправка Ajax запроса на сервер
const sendAjaxRequst = (data) => {
    let requestURL = "form_process.php"
    // создание экземпляра объекта XMLHttpRequest
    const xhr = new XMLHttpRequest()
    // настройка запроса (false - синхронный запрос)
    xhr.open('POST', requestURL, false)
    // xhr.setRequestHeader('Content-Type', 'application/json');

    // Обработчик события при завершении запроса
    xhr.onload = function () {
        let response = JSON.parse(xhr.responseText)
        // console.log(response)
        if (response.status === 'success') {
            // Здесь обрабатываем ответ от сервера
            document.querySelector("#alert-success").classList.remove('hidden')
        } else {
            document.querySelector('#alert-text-error').innerHTML = response.message
            document.querySelector("#alert-error").classList.remove('hidden')
        }
    };

    // Обработчик события при ошибке запроса
    xhr.onerror = function () {
        document.querySelector('#alert-text-error').innerHTML = 'Произошла ошибка при отправке запроса на сервер. Пожалуйсто попробуйте позже!'
        document.querySelector("#alert-error").classList.remove('hidden')
    };

    // Отправляем запрос на сервер
    xhr.send(data);
}

function handleFormSubmit(event) {
    event.preventDefault()
    preparationForm()

    let formData = serializeForm()
    formData = dataCleanlinessCheck(formData)
    checkEmail(formData)
    formData = handleFieldPhone(formData)
    checkSimpleFields(formData)

    if (formFillingError === false && countSuccess === 4) {
        sendAjaxRequst(formData)
    }
}

form.addEventListener("submit", handleFormSubmit)



document.querySelectorAll(".close-alert").forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector("#alert-success").classList.add('hidden')
        document.querySelector("#alert-error").classList.add('hidden')
    })
})

// Маска для телефона
function maskPhone(selector, masked = '+7 (___) ___-__-__') {
    const elems = document.querySelectorAll(selector);

    function mask(event) {
        const keyCode = event.keyCode;
        const template = masked,
            def = template.replace(/\D/g, ""),
            val = this.value.replace(/\D/g, "");
        let i = 0,
            newValue = template.replace(/[_\d]/g, function (a) {
                return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
            });
        i = newValue.indexOf("_");
        if (i !== -1) {
            newValue = newValue.slice(0, i);
        }
        let reg = template.substr(0, this.value.length).replace(/_+/g,
            function (a) {
                return "\\d{1," + a.length + "}";
            }).replace(/[+()]/g, "\\$&");
        reg = new RegExp("^" + reg + "$");
        if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) {
            this.value = newValue;
        }
        if (event.type === "blur" && this.value.length < 5) {
            this.value = "";
        }

    }

    for (const elem of elems) {
        elem.addEventListener("input", mask);
        elem.addEventListener("focus", mask);
        elem.addEventListener("blur", mask);
    }

}

maskPhone('#floating_phone')