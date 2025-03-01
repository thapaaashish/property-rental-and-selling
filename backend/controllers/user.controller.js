import { errorHandler } from "../utils/error.js";
import User from "../models/user.model.js";


export const test = (req, res) => {
    res.send("test route being called!!");
};

export const deleteUser = async (req, res, next) => {
    if(req.user.id!==req.params.id) return next(errorHandler(403, "Forbidden. Cannot delete another user"));
    try{
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie("access_token");
        res.status(200).json({message: "User deleted successfully"});

    }catch(error){
        next(error);
    }
};