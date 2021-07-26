import { useMutation } from "react-query";
import axios from "axios";
import { proxy } from "../utils/constant";
import { useContext } from 'react'
import { requestContext } from '../RequestContext';

export default function useListRooms() {
    const request = useContext(requestContext);
    return useMutation(async (query) => {
        const res = await axios.get(proxy + '/listrooms/' + query);
        const { rooms } = res.data
        return rooms;
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