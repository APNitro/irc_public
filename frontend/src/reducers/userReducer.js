export const initialUserState = {}
export function userReducer(state, action) {
    switch (action.type) {
        case 'login':
            return action.payload;
        case 'logout':
            return {}
    }
}