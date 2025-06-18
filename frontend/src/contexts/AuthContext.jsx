import axios from 'axios';
import httpstatus from 'http-status';
import { createContext } from 'react';
import { useState } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({});

const client = axios.create({
    baseURL: 'http://localhost:8000/api/v1/users'
});

export const AuthProvider = ({children}) => {
    const authContext = useContext(AuthContext);

    const[userData, setUserData] = useState(authContext);

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post('/register', {
                name: name,
                username: username,
                password: password
            });

            if(request.status === httpstatus.CREATED) {
                return request.data.message;
            }
        } catch (error) {
            throw error
        }
    }

    const handleLogin = async ( username, password) => {
        try {
            let request = await client.post('/login', {
                username: username,
                password: password
            });

            if(request.status === httpstatus.OK) {
                console.log(request.data);
                localStorage.setItem('token', request.data.tocken);
                router('/');
                return request;
            }
        } catch (error) {
            throw error ;       
        }
    }

    const data = {
        userData, setUserData, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data} >
            {children}
        </AuthContext.Provider>
    )
}