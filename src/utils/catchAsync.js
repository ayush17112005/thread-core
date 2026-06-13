export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/*
    So what this catchAsync doing?
        It takes a function as an argument 
        and return new fuction which takes req, res, next as arguments
        and then it will call the original function with req, res, next
        and if there is any error in the original function it will catch that error and pass it to next function
        so that express can handle that error and send response to the client

    So basically we will pass our controller function to this catchAsync 
    and it will return a promise if it is rejected it will catch the error and 
    next(error) will be called and our error handling middleware will handle that error and send response to the client
*/
