
// try-catch async handler
const asyncHandler = (func)=> async(req,res,next)=>{
    try {
        await func(req,res,next);
        
    } catch (error) {
        res.status(error.status || 500).json({success:false, message:error.message || "Internal Server Error"});
    }

}

export { asyncHandler};