import { Schema, model } from "mongoose";

const reqSchema = new Schema({
  req_title: {
    type: String,
    default: "new request",
  },
  req_url: {
    type: String,
    required: true,
  },
  req_method: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  },
  req_headers: {
    type: [
      {
        key: String,
        value: String,
      },
    ],
    default: {},
  },
  req_query: {
    type: [
      {
        key: String,
        value: String,
      },
    ],
    default: {},
  },
  req_body: {
    type: String,
  },
});

const ReqModel = model("request", reqSchema);
export default ReqModel;
