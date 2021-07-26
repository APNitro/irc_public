import { useMutation } from "react-query";
import axios from "axios";
import { proxy } from "../utils/constant";
import { useContext } from 'react'
import { requestContext } from '../RequestContext';

export default function useUserroom() {
    const request = useContext(requestContext);
    return useMutation(async (roomName) => {
        const res = await axios.get(proxy + '/getuserroom/' + roomName);
        const { room } = res.data
        return room;
    }, {
        onSuccess: () => {
            //request.setSuccess(`Vous êtes bien connecté !`)
        },
        onError: (error, mutationVariables) => {
            //request.setError(error.response.data.error)
        }
    }
    )
}