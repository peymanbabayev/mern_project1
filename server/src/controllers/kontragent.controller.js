import Kontragent from "../models/kontragent.model.js";

// @desc    Get all kontragents
// @route   GET /api/kontragents
// @access  Private
export const getKontragents = async (req, res) => {
    try {
        const { type, search, page = 1, limit = 10 } = req.query;
        const query = { company: req.user.companyId };
        if (type) query.type = type;
        if (search) query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ];

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const [kontragents, total] = await Promise.all([
            Kontragent.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Kontragent.countDocuments(query),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                kontragents,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Get single kontragent
// @route   GET /api/kontragents/:id
// @access  Private
export const getKontragentById = async (req, res) => {
    try {
        const kontragent = await Kontragent.findById(req.params.id);
        if (!kontragent) {
            return res.status(404).json({ message: "Kontragent not found", status: "fail" });
        }
        res.status(200).json({ status: "success", data: kontragent });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};

// @desc    Create new kontragent
// @route   POST /api/kontragents
// @access  Private
export const createKontragent = async (req, res) => {
    try {
        const kontragent = new Kontragent({ ...req.body, company: req.user.companyId });
        const createdKontragent = await kontragent.save();
        res.status(201).json({ status: "success", data: createdKontragent });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Update kontragent
// @route   PUT /api/kontragents/:id
// @access  Private
export const updateKontragent = async (req, res) => {
    try {
        const kontragent = await Kontragent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!kontragent) {
            return res.status(404).json({ message: "Kontragent not found", status: "fail" });
        }
        res.status(200).json({ status: "success", data: kontragent });
    } catch (error) {
        res.status(400).json({ message: error.message, status: "error" });
    }
};

// @desc    Delete kontragent
// @route   DELETE /api/kontragents/:id
// @access  Private
export const deleteKontragent = async (req, res) => {
    try {
        const kontragent = await Kontragent.findByIdAndDelete(req.params.id);
        if (!kontragent) {
            return res.status(404).json({ message: "Kontragent not found", status: "fail" });
        }
        res.status(200).json({ message: "Kontragent removed", status: "success" });
    } catch (error) {
        res.status(500).json({ message: error.message, status: "error" });
    }
};
