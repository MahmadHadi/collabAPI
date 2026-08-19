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
