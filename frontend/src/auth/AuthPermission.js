// AuthPermission.js is usually a helper file that deals with user permissions — basically, what a user is allowed to do in your app.

export const checkPermission = (user,permission)=>{
    if(!user || !user.permissions)
    {
        return false;
    }     
    return user.permissions.includes(permission);
}