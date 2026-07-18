class ApiResponse {
  constructor(res) {
    this.res = res;
    this.statusCode = 200;
    this.body = {
      status: 200,
      message: '',
      data: null
    };
  }

  status(code) {
    this.statusCode = code;
    this.body.status = code;
    return this;
  }

  success(message = 'Berhasil') {
    this.body.message = message;
    return this;
  }

  error(message = 'Gagal') {
    this.body.message = message;
    return this;
  }

  data(data) {
    this.body.data = data;
    return this;
  }

  pagination(pagination) {
    if (pagination) {
      this.body.pagination = pagination;
    }
    return this;
  }

  send() {
    return this.res.status(this.statusCode).json(this.body);
  }
}

module.exports = { ApiResponse }
