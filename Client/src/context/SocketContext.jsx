import {createContext, useContext, useEffect, useRef} from 'react';
import {useStore} from '@/store/store.js'
import {io} from 'socket.io-client'

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({children}) => {
    const socket = useRef(null);
    const {userInfo, addMessage} = useStore();

    useEffect(() => {
        if(userInfo){
            socket.current = io(import.meta.env.VITE_APP_SERVER_URL, {
              withCredentials: true,
              query: {
                userId: userInfo._id,
              },
            });

            socket.current.on('connect', () => {
                console.log("Connected to socket server");
            });

            const handleReceiveMessage = (message) => {
                const {selectedChatType, selectedChatData} = useStore.getState();
                if(selectedChatType != undefined &&
                    (selectedChatData._id === message.sender._id || selectedChatData._id === message.recipient._id)){
                    console.log("Received message: ", message);
                    addMessage(message);
                }
            }

            socket.current.on("receiveMessage", handleReceiveMessage);

            return () => {
                socket.current.disconnect();
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    )
}