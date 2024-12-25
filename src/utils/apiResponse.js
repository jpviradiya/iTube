class ApiResponse {
  constructor(statusCode, data, message = "success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400; //below 400 are success code status
  }
}
export { ApiResponse };

//! FOR GET REQ
//* INPUT:
// app.get("/success", (req, res) => {
//   const data = { id: 1, name: "John Doe" };
//   const response = new apiResponse(200, data, "User retrieved successfully");
//   res.status(response.statusCode).json(response); // Send structured response
// });
//* OUTPUT:
// {
//   "statusCode": 200,
//   "data": { "id": 1, "name": "John Doe" },
//   "message": "User retrieved successfully",
//   "success": true
// }

//! FOR ERROR REQ
//* INPUT:
// app.get("/error", (req, res) => {
//   const response = new apiResponse(404, null, "User not found");
//   res.status(response.statusCode).json(response);
// });
//* OUTPUT:
// {
//   "statusCode": 404,
//   "data": null,
//   "message": "User not found",
//   "success": false
// }
