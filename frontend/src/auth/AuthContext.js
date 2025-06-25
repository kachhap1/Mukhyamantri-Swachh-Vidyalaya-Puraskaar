//AuthCOntext.js

import React, { createContext, useContext, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) =>{
    const [token, setToken] = useState(localStorage.getItem("authToken")||null);
    const [allSurveyData, setAllSurveyData] = useState(null);
    const [scores,setScores] = useState({});

    const saveToken = (newToken)=>{
        setToken(newToken);
        localStorage.setItem("token",newToken);
    };


    const saveScores = (newScores)=> {setScores(newScores);};
    const saveallData = (data) => {setAllSurveyData(data);};

    return(
        <AuthContext.Provider value={{token,saveToken,allSurveyData,saveScores,scores,saveallData}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);