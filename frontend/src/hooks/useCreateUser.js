import { useMutation, queryCache } from "react-query";
import axios from "axios";
import {proxy} from "../utils/constant"
import { useContext } from 'react'
import { requestContext } from '../RequestContext';

export default function useCreateUser() {
  const request = useContext(requestContext);
  return useMutation((user) => axios.post(proxy + "/users/register", user).then(res => res.data),
  {
    onSuccess: () => queryCache.refetchQueries('user'),
    onError: (error, mutationVariables) => {
      request.setError(error.response.data.error)
  }
  });
}