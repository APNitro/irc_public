import { useMutation } from "react-query";
import axios from "axios";
import {proxy} from "../utils/constant";
import setJWTToken from '../utils/setJWTToken';
import jwt_decode from "jwt-decode";
import { useContext } from 'react'
import { requestContext } from '../RequestContext';

export default function useUser() {
    const request = useContext(requestContext);
    return useMutation( async (log) => 
        {   const res = await axios.post(proxy + '/users/login/', log);
            console.log(res)
        const {token, userId, name } = res.data
            localStorage.setItem("jwtToken", token);
            setJWTToken(token);
            const decoded = jwt_decode(token);
            return decoded
        }, {
            onSuccess: () => {
                request.setSuccess(`Vous êtes bien connecté !`)
            },
            onError: (error, mutationVariables) => {
                request.setError(error.response.data.error)
              }
        }
    )
}