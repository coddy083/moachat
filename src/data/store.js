export function reducer(state, action) {
    switch (action.type) {
        case 'SET_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: action.payload
            };
        case 'ADD_CHAT_MESSAGE':
            return {
                ...state,
                chatMessages: [...state.chatMessages, action.payload]
            };
        case "SET_ROOM_NUMBER":
            return {
                ...state,
                roomNumber: action.payload
            };
        case "SET_SOCKET":
            return {
                ...state,
                socket: action.payload
            };
        default:
            return {
                ...state,
                chatMessages: [],
                roomNumber: null,
                socket: null
            };
    }
}