export const apiFormPost = async (url, formData, token = null) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        body: formData,
      });
  
      if (!response.ok) throw new Error("Form POST failed");
      return await response.json();
    } catch (error) {
      console.error("apiFormPost error:", error);
      throw error;
    }
  };
  

export const apiJSONPost = async(URL, data,token)=>{
    try{
        const response = await fetch(URL,{
            method:"POST",
            headers:{
                "Content_Type":"application/json",
                Authorization:`Bearer ${token}`,
            },
            body:JSON.stringify(data),
        });
        if(!response.ok) throw new Error("POST failed");
        return await response.json();
    }catch(error){
        console.error("apiJSONPost error:",error);
        throw error;
    }
};

export const parseJwtData = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (err) {
      return null;
    }
  };
  
// export const parseJwtData = (token)=>{
//     if(!token) return null;
//     try{
//         return JSON.parse(atob(token.split(".")[1]));
//     }catch(error){
//         console.error("JWT parse error:",error);
//         return null;
//     }
// };