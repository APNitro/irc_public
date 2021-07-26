import { useMutation, queryCache } from "react-query";
import axios from "axios";
import {proxy} from "../utils/constant"
import setJWTToken from '../utils/setJWTToken';
import jwt_decode from "jwt-decode";

export default function useEditPseudo() {
  return useMutation(async (pseudo) => {
    const res = await axios.post(proxy + "/editpseudo", pseudo);
    if (res.data.userId) {
    const { token, userId } = res.data
            localStorage.setItem("jwtToken", token);
            setJWTToken(token);
            const decoded = jwt_decode(token);
            return decoded
    } else {
      return res;
    }
  },
  {
    

  });
}