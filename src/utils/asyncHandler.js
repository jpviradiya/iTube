// const asyncHandler = () => {};
// const asyncHandler = () => { () => { } };
// const asyncHandler = () => () => { };     // syntax for higher odrder function call for function

//! one method is use to call another method
//! It eliminates the need for try-catch blocks in every asynchronous route handler. 
// using promises
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)) // executes the given funtion provided during function call
      .catch((err) => next(err)); // if error occure then next is call to execute
  };
};

// using try-catch
// const asyncHandler = (fn) => async (err, req, res, next) => {
//   try {
//     await fn(err, req, res, next); // executes the given funtion provided during function call
//   } catch (err) {
//     res.send(err.code).json({
//       sucess: false,
//       message: err.message,
//     });
//   }
// };

export { asyncHandler };
