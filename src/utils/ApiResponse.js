class ApiResponse {
  constructor(
    statusCode,
    responseMessage = "Successful Response",
    data = null,
  ) {
    this.statusCode = statusCode;
    this.responseMessage = responseMessage;
    this.data = data;
    this.success = statusCode >= 200 && statusCode < 300;
  }
}

export { ApiResponse };
