import ReqModel from "../models/ReqModel.js";

// CREATE
export const createRequest = async (req, res) => {
  try {
    const newRequest = new ReqModel(req.body);
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// READ - All
export const getAllRequests = async (req, res) => {
  try {
    const requests = await ReqModel.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ - One
export const getRequestById = async (req, res) => {
  try {
    const request = await ReqModel.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
export const updateRequest = async (req, res) => {
  try {
    const updated = await ReqModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE
export const deleteRequest = async (req, res) => {
  try {
    const deleted = await ReqModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Request not found" });
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// RUN REQUEST
export const runRequest = async (req, res) => {
  try {
    // Get saved request
    const request = await ReqModel.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        error: "Request not found",
      });
    }

    // Convert headers array -> object
    const headers = Object.fromEntries(
      request.req_headers.map((item) => [
        item.key,
        item.value,
      ])
    );

    // Convert query array -> object
    const params = Object.fromEntries(
      request.req_query.map((item) => [
        item.key,
        item.value,
      ])
    );

    // Start timer
    const startTime = Date.now();

    // Execute request
    const response = await axios({
      method: request.req_method,
      url: request.req_url,
      headers,
      params,
      data: request.req_body || undefined,

      // Allow 4xx and 5xx responses
      validateStatus: () => true,
    });

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Send result back
    res.json({
      status: response.status,
      statusText: response.statusText,
      responseTime,
      headers: response.headers,
      body: response.data,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};