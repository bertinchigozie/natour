import axios from 'axios'
import {showAlert} from './alert'


export const login = async (email, password) =>{

    try {
        const res = await axios({
            method:'POST',
            url:'http://localhost:8080/api/v1/users/login',
            data:{
                email,
                password
            }
        })
        if(res.data.status==='success'){
            showAlert('success', 'logged in successfully')
            window.setTimeout(()=>{
                location.assign('/')
            }, 1500)
        }
        
        
    } catch (error) {
        showAlert('error', 'log in not successfully')
    }
}

// document.querySelector('.form').addEventListener('submit', e=>{
//     e.preventDefault()
//     const email=document.getElementById('email').value;
//     const password = document.getElementById('password').value
// login(email,password)
// })

export const logout = async()=>{
    try{
        const res = await axios ({
            method: 'GET',
            url:'http://localhost:8080/api/v1/users/logout',

        })
        console.log(res)
        if(res.data.status === 'success'){
            location.reload(true)
        }
    } catch(err){
        showAlert('error', 'Error logging out')
    }
}