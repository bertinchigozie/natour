import '@babel/polyfill'
import {login, logout} from './login'
import { updateData } from './updateSettings'

const formLogin = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')


if(formLogin) formLogin.addEventListener('submit', e=>{
    e.preventDefault()
    const email=document.getElementById('email').value;
    const password = document.getElementById('password').value
login(email,password)
})

if(logoutBtn) logoutBtn.addEventListener('click', logout)

if(userDataForm) userDataForm.addEventListener('submit', e=>{
    e.preventDefault()
    const form = new FormData()
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])
    // const email=document.getElementById('email').value;
    // const name=document.getElementById('name').value;
    // updateData({name, email}, 'data')
    updateData(form, 'data')
})
if(userPasswordForm) userPasswordForm.addEventListener('submit', async e=>{
    e.preventDefault()
    const passwordCurrent=document.getElementById('password-current').value;
    const password=document.getElementById('password').value;
    const passwordConfirm=document.getElementById('password-confirm').value;
   await updateData( {passwordCurrent, password, passwordConfirm}, 'password')

   document.getElementById('password-current').value=''
   document.getElementById('password').value=''
   document.getElementById('password-confirm').value=''
})


